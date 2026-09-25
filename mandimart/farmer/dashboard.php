<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$farmer_name = $_SESSION['user_name'];

// Fetch counts
$my_crops_count = 0;
$active_auctions_count = 0;
$inquiries_count = 0;
$notifications_count = 0;
$recent_crops = [];
$recent_inquiries = [];

if (isset($pdo)) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM crops WHERE farmer_id = ? AND status = 'active'");
        $stmt->execute([$farmer_id]);
        $my_crops_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM auctions WHERE farmer_id = ? AND status = 'active'");
        $stmt->execute([$farmer_id]);
        $active_auctions_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM inquiries WHERE farmer_id = ? AND status = 'pending'");
        $stmt->execute([$farmer_id]);
        $inquiries_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$farmer_id]);
        $notifications_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT * FROM crops WHERE farmer_id = ? ORDER BY id DESC LIMIT 4");
        $stmt->execute([$farmer_id]);
        $recent_crops = $stmt->fetchAll();

        $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE farmer_id = ? ORDER BY id DESC LIMIT 4");
        $stmt->execute([$farmer_id]);
        $recent_inquiries = $stmt->fetchAll();
    } catch (Exception $e) {}
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Top Bar -->
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 mb-4 border-bottom">
    <div>
      <span class="text-success fw-bold small"><i class="fa-solid fa-tractor me-1"></i> Farmer Portal</span>
      <h2 class="fw-bold mb-0">Welcome, <?php echo htmlspecialchars($farmer_name); ?> ji! 🌾</h2>
      <p class="text-muted small mb-0">Manage your crop listings, live auctions, and buyer inquiries.</p>
    </div>
    <div class="mt-3 mt-md-0 d-flex gap-2">
      <a href="/farmer/add_crop.php" class="btn btn-success rounded-pill px-3"><i class="fa-solid fa-plus me-1"></i> Add Crop</a>
      <a href="/farmer/create_auction.php" class="btn btn-warning rounded-pill px-3 text-dark fw-bold"><i class="fa-solid fa-gavel me-1"></i> New Auction</a>
    </div>
  </div>

  <!-- Metric Cards -->
  <div class="row g-3 mb-4">
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">My Active Crops</span>
            <h3 class="fw-bold text-success mb-0"><?php echo $my_crops_count; ?></h3>
          </div>
          <div class="p-3 bg-success-subtle text-success rounded-circle">
            <i class="fa-solid fa-seedling fs-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Active Auctions</span>
            <h3 class="fw-bold text-warning mb-0"><?php echo $active_auctions_count; ?></h3>
          </div>
          <div class="p-3 bg-warning-subtle text-warning rounded-circle">
            <i class="fa-solid fa-gavel fs-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Pending Inquiries</span>
            <h3 class="fw-bold text-primary mb-0"><?php echo $inquiries_count; ?></h3>
          </div>
          <div class="p-3 bg-primary-subtle text-primary rounded-circle">
            <i class="fa-solid fa-envelope fs-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Unread Alerts</span>
            <h3 class="fw-bold text-danger mb-0"><?php echo $notifications_count; ?></h3>
          </div>
          <div class="p-3 bg-danger-subtle text-danger rounded-circle">
            <i class="fa-solid fa-bell fs-4"></i>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Action Navigation Tabs -->
  <div class="card border-0 shadow-sm rounded-4 p-2 mb-4 bg-light">
    <div class="d-flex flex-wrap gap-2">
      <a href="/farmer/my_crops.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-list me-1"></i> My Crops</a>
      <a href="/farmer/auctions.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-gavel me-1"></i> My Auctions</a>
      <a href="/farmer/inquiries.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-comments me-1"></i> Buyer Inquiries</a>
      <a href="/farmer/mandi_prices.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-chart-line me-1"></i> Mandi Prices</a>
      <a href="/farmer/find_mandi.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-location-dot me-1"></i> Find Mandi</a>
      <a href="/ai/comparison.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-leaf me-1"></i> AI Vegetable Comparison</a>
      <a href="/ai/chatbot.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-robot me-1"></i> AI Assistant</a>
      <a href="/farmer/notifications.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-bell me-1"></i> Notifications</a>
    </div>
  </div>

  <div class="row g-4">
    <!-- Recent Crops Table -->
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">My Recent Crop Listings</h5>
          <a href="/farmer/my_crops.php" class="small text-success fw-bold text-decoration-none">View All</a>
        </div>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead class="table-light small">
              <tr>
                <th>Crop Name</th>
                <th>Quantity</th>
                <th>Grade</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody class="small">
              <?php if (empty($recent_crops)): ?>
                <tr>
                  <td colspan="6" class="text-center py-4 text-muted">
                    No crops listed yet. <a href="/farmer/add_crop.php" class="text-success fw-bold">List your first crop</a>
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($recent_crops as $crop): ?>
                  <tr>
                    <td class="fw-bold"><?php echo htmlspecialchars($crop['name']); ?></td>
                    <td><?php echo htmlspecialchars($crop['quantity'] . ' ' . $crop['unit']); ?></td>
                    <td><span class="badge bg-success-subtle text-success"><?php echo htmlspecialchars($crop['grade']); ?></span></td>
                    <td class="fw-bold"><?php echo format_currency($crop['expected_price']); ?></td>
                    <td><span class="badge bg-success rounded-pill"><?php echo htmlspecialchars($crop['status']); ?></span></td>
                    <td>
                      <a href="/farmer/edit_crop.php?id=<?php echo $crop['id']; ?>" class="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"><i class="fa-solid fa-pen"></i></a>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Recent Inquiries -->
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Recent Buyer Inquiries</h5>
          <a href="/farmer/inquiries.php" class="small text-success fw-bold text-decoration-none">View All</a>
        </div>
        <?php if (empty($recent_inquiries)): ?>
          <div class="text-center py-4 text-muted small">No inquiries received yet.</div>
        <?php else: ?>
          <div class="d-flex flex-column gap-3">
            <?php foreach ($recent_inquiries as $inq): ?>
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="small text-dark"><?php echo htmlspecialchars($inq['buyer_name'] ?? 'Wholesale Buyer'); ?></strong>
                  <span class="badge <?php echo $inq['status'] === 'accepted' ? 'bg-success' : ($inq['status'] === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'); ?> rounded-pill small">
                    <?php echo htmlspecialchars($inq['status']); ?>
                  </span>
                </div>
                <p class="small text-muted mb-2"><?php echo htmlspecialchars($inq['message']); ?></p>
                <div class="d-flex justify-content-between align-items-center small text-secondary">
                  <span>Req: <?php echo htmlspecialchars($inq['quantity']); ?> Qtl</span>
                  <a href="/farmer/inquiries.php" class="text-success fw-bold text-decoration-none">Respond &rarr;</a>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
