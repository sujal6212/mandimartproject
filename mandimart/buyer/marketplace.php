<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$search = trim($_GET['search'] ?? '');
$location = trim($_GET['location'] ?? '');
$grade = trim($_GET['grade'] ?? '');
$max_price = floatval($_GET['max_price'] ?? 0);

$query = "
    SELECT c.*, u.name as farmer_name, u.phone as farmer_phone
    FROM crops c
    JOIN users u ON c.farmer_id = u.id
    WHERE c.status = 'active'
";
$params = [];

if (!empty($search)) {
    $query .= " AND (c.name LIKE ? OR c.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if (!empty($location)) {
    $query .= " AND (c.location LIKE ?)";
    $params[] = "%$location%";
}
if (!empty($grade)) {
    $query .= " AND c.grade = ?";
    $params[] = $grade;
}
if ($max_price > 0) {
    $query .= " AND c.expected_price <= ?";
    $params[] = $max_price;
}

$query .= " ORDER BY c.id DESC";

$crops = [];
if (isset($pdo)) {
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $crops = $stmt->fetchAll();
}

// Handle Inquiry Submission
$inquiry_success = '';
$inquiry_error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send_inquiry') {
    if (!isset($_SESSION['user_id'])) {
        $inquiry_error = 'Please log in as a buyer to send inquiries to farmers.';
    } else {
        $buyer_id = $_SESSION['user_id'];
        $crop_id = intval($_POST['crop_id']);
        $farmer_id = intval($_POST['farmer_id']);
        $quantity = floatval($_POST['quantity']);
        $message = trim($_POST['message']);

        if (empty($message) || $quantity <= 0) {
            $inquiry_error = 'Please provide required quantity and a message.';
        } elseif (isset($pdo)) {
            $inq_stmt = $pdo->prepare("INSERT INTO inquiries (buyer_id, farmer_id, crop_id, quantity, message, status) VALUES (?, ?, ?, ?, ?, 'pending')");
            $res = $inq_stmt->execute([$buyer_id, $farmer_id, $crop_id, $quantity, $message]);
            if ($res) {
                create_notification($pdo, $farmer_id, 'New Buyer Inquiry', "A buyer sent an inquiry for {$quantity} Quintal of your crop.");
                $inquiry_success = 'Your inquiry has been directly sent to the farmer!';
            }
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Title -->
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
    <div>
      <span class="text-success fw-bold small"><i class="fa-solid fa-store me-1"></i> Transparent Marketplace</span>
      <h2 class="fw-bold mb-0">Agricultural Produce Marketplace</h2>
      <p class="text-muted small mb-0">Procure verified harvests directly from Indian farmers with zero middleman commissions.</p>
    </div>
    <div class="mt-3 mt-md-0">
      <a href="/farmer/mandi_prices.php" class="btn btn-outline-success btn-sm rounded-pill"><i class="fa-solid fa-chart-line me-1"></i> Check Mandi Prices</a>
    </div>
  </div>

  <?php if ($inquiry_success): ?>
    <div class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($inquiry_success); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>
  <?php if ($inquiry_error): ?>
    <div class="alert alert-danger alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($inquiry_error); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>

  <!-- Search & Filter Bar -->
  <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
    <form action="marketplace.php" method="GET" class="row g-2 align-items-center">
      <div class="col-md-3">
        <input type="text" name="search" class="form-control rounded-pill form-control-sm" placeholder="Search tomato, wheat, onion..." value="<?php echo htmlspecialchars($search); ?>">
      </div>
      <div class="col-md-3">
        <input type="text" name="location" class="form-control rounded-pill form-control-sm" placeholder="Location e.g. Karnal, Punjab" value="<?php echo htmlspecialchars($location); ?>">
      </div>
      <div class="col-md-2">
        <select name="grade" class="form-select rounded-pill form-select-sm">
          <option value="">All Grades</option>
          <option value="A+" <?php if ($grade === 'A+') echo 'selected'; ?>>Grade A+</option>
          <option value="A" <?php if ($grade === 'A') echo 'selected'; ?>>Grade A</option>
          <option value="B" <?php if ($grade === 'B') echo 'selected'; ?>>Grade B</option>
        </select>
      </div>
      <div class="col-md-2">
        <input type="number" name="max_price" class="form-control rounded-pill form-control-sm" placeholder="Max Price (₹)" value="<?php echo $max_price > 0 ? $max_price : ''; ?>">
      </div>
      <div class="col-md-2 d-flex gap-2">
        <button type="submit" class="btn btn-success btn-sm rounded-pill flex-fill fw-bold"><i class="fa-solid fa-filter me-1"></i> Filter</button>
        <a href="marketplace.php" class="btn btn-outline-secondary btn-sm rounded-pill"><i class="fa-solid fa-rotate-left"></i></a>
      </div>
    </form>
  </div>

  <!-- Crop Grid -->
  <div class="row g-4 mb-5">
    <?php if (empty($crops)): ?>
      <div class="col-12 text-center py-5 text-muted">
        <i class="fa-solid fa-wheat-awn fs-1 mb-2"></i>
        <h5>No crops match your search criteria.</h5>
        <a href="marketplace.php" class="btn btn-success btn-sm rounded-pill mt-2">Reset Filters</a>
      </div>
    <?php else: ?>
      <?php foreach ($crops as $c): ?>
        <div class="col-md-6 col-lg-4 crop-card-wrapper"
             data-id="<?php echo $c['id']; ?>"
             data-name="<?php echo htmlspecialchars($c['name']); ?>"
             data-farmer="<?php echo htmlspecialchars($c['farmer_name']); ?>"
             data-location="<?php echo htmlspecialchars($c['location']); ?>"
             data-quantity="<?php echo htmlspecialchars($c['quantity'] . ' ' . $c['unit']); ?>"
             data-price="<?php echo htmlspecialchars($c['expected_price']); ?>"
             data-grade="<?php echo htmlspecialchars($c['grade']); ?>"
             data-rating="<?php echo htmlspecialchars($c['rating']); ?>">
          <div class="card h-100 border shadow-sm rounded-4 overflow-hidden position-relative">
            <!-- Grade Badge -->
            <div class="position-absolute top-0 end-0 m-3 z-1">
              <span class="badge bg-warning text-dark fw-bold">Grade <?php echo htmlspecialchars($c['grade']); ?></span>
            </div>

            <div class="bg-light d-flex align-items-center justify-content-center p-4 position-relative" style="height: 180px;">
              <i class="fa-solid fa-leaf text-success fs-1"></i>
              <!-- Compare Checkbox -->
              <div class="position-absolute top-0 start-0 m-2">
                <div class="form-check bg-white px-2 py-1 rounded-pill shadow-sm small border">
                  <input class="form-check-input compare-checkbox" type="checkbox" value="<?php echo $c['id']; ?>" id="cmp_<?php echo $c['id']; ?>" onchange="handleCompareChange(this)">
                  <label class="form-check-label fw-bold text-muted small ms-1" for="cmp_<?php echo $c['id']; ?>">Compare</label>
                </div>
              </div>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-muted small"><i class="fa-solid fa-user me-1"></i> <?php echo htmlspecialchars($c['farmer_name']); ?></span>
                <span class="text-warning small"><i class="fa-solid fa-star"></i> <?php echo htmlspecialchars($c['rating']); ?></span>
              </div>

              <h5 class="fw-bold mb-1"><?php echo htmlspecialchars($c['name']); ?></h5>
              <div class="text-success fw-bold fs-5 mb-2">₹<?php echo number_format($c['expected_price']); ?> <span class="fs-6 text-muted font-normal">/ <?php echo htmlspecialchars($c['unit']); ?></span></div>

              <p class="small text-muted mb-3 flex-grow-1"><?php echo htmlspecialchars(substr($c['description'] ?? 'Direct farm produce ready for bulk delivery.', 0, 85)); ?>...</p>

              <div class="d-flex justify-content-between text-muted small border-top pt-2 mb-3">
                <span>Available: <strong><?php echo htmlspecialchars($c['quantity'] . ' ' . $c['unit']); ?></strong></span>
                <span><i class="fa-solid fa-location-dot me-1"></i><?php echo htmlspecialchars($c['location']); ?></span>
              </div>

              <div class="d-flex gap-2">
                <a href="/buyer/crop_details.php?id=<?php echo $c['id']; ?>" class="btn btn-sm btn-outline-secondary flex-fill rounded-pill">Details</a>
                <button type="button" class="btn btn-sm btn-success flex-fill rounded-pill fw-bold"
                        data-bs-toggle="modal"
                        data-bs-target="#inquiryModal"
                        data-crop-id="<?php echo $c['id']; ?>"
                        data-crop-name="<?php echo htmlspecialchars($c['name']); ?>"
                        data-farmer-id="<?php echo $c['farmer_id']; ?>"
                        data-farmer-name="<?php echo htmlspecialchars($c['farmer_name']); ?>">
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>

<!-- Floating Compare Bar (Sticky Bottom) -->
<div id="compareBar" class="fixed-bottom bg-dark text-white p-3 shadow-lg d-none border-top border-secondary">
  <div class="container d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
      <span class="badge bg-warning text-dark fs-6" id="compareCount">0 Selected</span>
      <span class="small text-white-50 d-none d-md-inline">Select up to 4 crops for side-by-side spec comparison</span>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-sm btn-outline-light rounded-pill px-3" onclick="clearComparison()">Clear</button>
      <button class="btn btn-sm btn-success rounded-pill px-4 fw-bold" onclick="openComparisonModal()">Compare Side-by-Side &rarr;</button>
    </div>
  </div>
</div>

<!-- Comparison Modal -->
<div class="modal fade" id="compareModal" tabindex="-1">
  <div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header bg-success text-white py-3">
        <h5 class="modal-title fw-bold">🌾 Produce Comparison Tool</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4" id="compareTableContainer">
        <!-- Rendered dynamically by JS -->
      </div>
    </div>
  </div>
</div>

<!-- Inquiry Modal -->
<div class="modal fade" id="inquiryModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header bg-success text-white py-3">
        <h5 class="modal-title fw-bold">Direct Farmer Inquiry</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="marketplace.php" method="POST">
        <input type="hidden" name="action" value="send_inquiry">
        <input type="hidden" name="crop_id" id="modalCropId">
        <input type="hidden" name="farmer_id" id="modalFarmerId">

        <div class="modal-body p-4">
          <div class="alert alert-light border small text-muted mb-3">
            Inquiry for: <strong class="text-dark" id="modalCropName">Crop Name</strong><br>
            Farmer: <span class="text-dark" id="modalFarmerName">Farmer</span>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Required Quantity (Quintals) *</label>
            <input type="number" step="0.5" name="quantity" class="form-control rounded-3" placeholder="e.g. 25" required>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Message to Farmer *</label>
            <textarea name="message" class="form-control rounded-3" rows="4" placeholder="Mention preferred loading dates, delivery destination, target budget, or packaging requirements..." required></textarea>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold">Send Direct Inquiry</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
let selectedCrops = [];

function handleCompareChange(cb) {
  const card = cb.closest('.crop-card-wrapper');
  const cropData = {
    id: card.getAttribute('data-id'),
    name: card.getAttribute('data-name'),
    farmer: card.getAttribute('data-farmer'),
    location: card.getAttribute('data-location'),
    quantity: card.getAttribute('data-quantity'),
    price: card.getAttribute('data-price'),
    grade: card.getAttribute('data-grade'),
    rating: card.getAttribute('data-rating')
  };

  if (cb.checked) {
    if (selectedCrops.length >= 4) {
      alert('You can compare a maximum of 4 crops simultaneously.');
      cb.checked = false;
      return;
    }
    selectedCrops.push(cropData);
  } else {
    selectedCrops = selectedCrops.filter(c => c.id !== cropData.id);
  }
  updateCompareBar();
}

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  const count = document.getElementById('compareCount');
  count.innerText = `${selectedCrops.length} Selected`;

  if (selectedCrops.length > 0) {
    bar.classList.remove('d-none');
  } else {
    bar.classList.add('d-none');
  }
}

function clearComparison() {
  selectedCrops = [];
  document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
  updateCompareBar();
}

function openComparisonModal() {
  if (selectedCrops.length === 0) return;
  const container = document.getElementById('compareTableContainer');

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th class="text-start" style="min-width: 150px;">Specification</th>
            ${selectedCrops.map(c => `<th style="min-width: 180px;">${c.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th class="text-start table-light">Farmer Name</th>
            ${selectedCrops.map(c => `<td><strong>${c.farmer}</strong></td>`).join('')}
          </tr>
          <tr>
            <th class="text-start table-light">Location</th>
            ${selectedCrops.map(c => `<td><i class="fa-solid fa-location-dot text-danger me-1"></i>${c.location}</td>`).join('')}
          </tr>
          <tr>
            <th class="text-start table-light">Quality Grade</th>
            ${selectedCrops.map(c => `<td><span class="badge bg-warning text-dark px-3 py-1">Grade ${c.grade}</span></td>`).join('')}
          </tr>
          <tr>
            <th class="text-start table-light">Price (₹/Qtl)</th>
            ${selectedCrops.map(c => `<td class="text-success fw-bold fs-5">₹${Number(c.price).toLocaleString()}</td>`).join('')}
          </tr>
          <tr>
            <th class="text-start table-light">Available Quantity</th>
            ${selectedCrops.map(c => `<td>${c.quantity}</td>`).join('')}
          </tr>
          <tr>
            <th class="text-start table-light">Farmer Rating</th>
            ${selectedCrops.map(c => `<td><i class="fa-solid fa-star text-warning"></i> ${c.rating} / 5.0</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
  container.innerHTML = html;
  const modal = new bootstrap.Modal(document.getElementById('compareModal'));
  modal.show();
}

// Pass info to inquiry modal
const inqModal = document.getElementById('inquiryModal');
if (inqModal) {
  inqModal.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    document.getElementById('modalCropId').value = button.getAttribute('data-crop-id');
    document.getElementById('modalFarmerId').value = button.getAttribute('data-farmer-id');
    document.getElementById('modalCropName').innerText = button.getAttribute('data-crop-name');
    document.getElementById('modalFarmerName').innerText = button.getAttribute('data-farmer-name');
  });
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
