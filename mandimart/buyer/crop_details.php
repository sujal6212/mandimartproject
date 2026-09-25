<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$crop_id = intval($_GET['id'] ?? 0);
$crop = null;
$msg = '';
$err = '';

if (isset($pdo)) {
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email, u.village, u.district, u.state
        FROM crops c
        JOIN users u ON c.farmer_id = u.id
        WHERE c.id = ?
    ");
    $stmt->execute([$crop_id]);
    $crop = $stmt->fetch();

    if (!$crop) {
        header("Location: /buyer/marketplace.php");
        exit();
    }
}

// Handle Inquiry
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'inquire') {
    if (!isset($_SESSION['user_id'])) {
        $err = 'Please log in to contact this farmer.';
    } else {
        $buyer_id = $_SESSION['user_id'];
        $quantity = floatval($_POST['quantity'] ?? 0);
        $message = trim($_POST['message'] ?? '');

        if ($quantity <= 0 || empty($message)) {
            $err = 'Please specify required quantity and message.';
        } elseif (isset($pdo)) {
            $inq = $pdo->prepare("INSERT INTO inquiries (buyer_id, farmer_id, crop_id, quantity, message, status) VALUES (?, ?, ?, ?, ?, 'pending')");
            $inq->execute([$buyer_id, $crop['farmer_id'], $crop_id, $quantity, $message]);
            create_notification($pdo, $crop['farmer_id'], 'Direct Crop Inquiry', "A buyer contacted you for {$quantity} Quintal {$crop['name']}.");
            $msg = 'Your inquiry was delivered to the farmer successfully!';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb small">
      <li class="breadcrumb-item"><a href="/index.php" class="text-success text-decoration-none">Home</a></li>
      <li class="breadcrumb-item"><a href="/buyer/marketplace.php" class="text-success text-decoration-none">Marketplace</a></li>
      <li class="breadcrumb-item active"><?php echo htmlspecialchars($crop['name']); ?></li>
    </ol>
  </nav>

  <?php if ($msg): ?>
    <div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div>
  <?php endif; ?>
  <?php if ($err): ?>
    <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($err); ?></div>
  <?php endif; ?>

  <div class="row g-4">
    <!-- Image & Produce Visuals -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="bg-light d-flex align-items-center justify-content-center p-5" style="min-height: 380px;">
          <i class="fa-solid fa-seedling text-success" style="font-size: 6rem;"></i>
        </div>
        <div class="card-body p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-warning text-dark fs-6 px-3 py-2">Quality Grade: <?php echo htmlspecialchars($crop['grade']); ?></span>
            <span class="text-muted"><i class="fa-solid fa-star text-warning"></i> <?php echo htmlspecialchars($crop['rating']); ?> / 5.0 Rating</span>
          </div>
        </div>
      </div>

      <!-- Produce Description -->
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3">Produce Details & Harvest Information</h5>
        <p class="text-secondary"><?php echo nl2br(htmlspecialchars($crop['description'] ?? 'Direct farm produce fresh from fields.')); ?></p>
        <hr class="text-muted">
        <div class="row g-2 text-muted small">
          <div class="col-6"><strong>Unit:</strong> <?php echo htmlspecialchars($crop['unit']); ?></div>
          <div class="col-6"><strong>Storage:</strong> Farm Barn / Cold Room</div>
          <div class="col-6"><strong>Packaging:</strong> Jute Bags / Crates</div>
          <div class="col-6"><strong>Dispatch:</strong> Ready within 24 Hours</div>
        </div>
      </div>
    </div>

    <!-- Farmer Info & Direct Inquiry -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h2 class="fw-bold text-dark mb-1"><?php echo htmlspecialchars($crop['name']); ?></h2>
        <div class="text-success fw-bold display-6 mb-3">₹<?php echo number_format($crop['expected_price']); ?> <span class="fs-5 text-muted font-normal">/ <?php echo htmlspecialchars($crop['unit']); ?></span></div>

        <div class="bg-light p-3 rounded-3 mb-4">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Available Quantity:</span>
            <strong class="text-dark fs-6"><?php echo htmlspecialchars($crop['quantity'] . ' ' . $crop['unit']); ?></strong>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Farm Location:</span>
            <strong class="text-dark"><?php echo htmlspecialchars($crop['location']); ?></strong>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted">Listing Status:</span>
            <span class="badge bg-success rounded-pill"><?php echo strtoupper($crop['status']); ?></span>
          </div>
        </div>

        <!-- Verified Farmer Card -->
        <div class="p-3 border rounded-3 mb-4 bg-white">
          <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-user-check me-2"></i>Verified Producer Details</h6>
          <div class="small text-secondary mb-1"><strong>Farmer Name:</strong> <?php echo htmlspecialchars($crop['farmer_name']); ?></div>
          <div class="small text-secondary mb-1">
            <strong>Contact Mobile:</strong>
            <a href="tel:<?php echo htmlspecialchars($crop['farmer_phone']); ?>" class="text-success fw-bold text-decoration-none">
              <i class="fa-solid fa-phone me-1"></i><?php echo htmlspecialchars($crop['farmer_phone']); ?>
            </a>
          </div>
          <div class="small text-secondary"><strong>Region:</strong> <?php echo htmlspecialchars($crop['village'] . ', ' . $crop['district'] . ', ' . $crop['state']); ?></div>
        </div>

        <!-- Inquiry Form -->
        <h5 class="fw-bold mb-3">Send Direct Inquiry / Request Quote</h5>
        <form action="crop_details.php?id=<?php echo $crop['id']; ?>" method="POST">
          <input type="hidden" name="action" value="inquire">
          <div class="mb-3">
            <label class="form-label small fw-bold">Required Quantity (<?php echo htmlspecialchars($crop['unit']); ?>) *</label>
            <input type="number" step="0.5" name="quantity" class="form-control rounded-3" placeholder="e.g. 50" required>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Message to Farmer *</label>
            <textarea name="message" class="form-control rounded-3" rows="3" placeholder="Specify expected delivery schedule, inspection preferences, or packaging..." required></textarea>
          </div>

          <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">
            <i class="fa-solid fa-paper-plane me-2"></i> Submit Inquiry to Farmer
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
