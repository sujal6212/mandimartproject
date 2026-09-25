<?php
require_once __DIR__ . '/../includes/buyer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$buyer_id = $_SESSION['user_id'];
$buyer_name = $_SESSION['user_name'];

$active_bids_count = 0;
$inquiries_count = 0;
$active_crops_count = 0;
$notifications_count = 0;
$recent_bids = [];
$recent_inquiries = [];

if (isset($pdo)) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(DISTINCT auction_id) FROM bids WHERE buyer_id = ?");
        $stmt->execute([$buyer_id]);
        $active_bids_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM inquiries WHERE buyer_id = ?");
        $stmt->execute([$buyer_id]);
        $inquiries_count = $stmt->fetchColumn();

        $stmt = $pdo->query("SELECT COUNT(*) FROM crops WHERE status = 'active'");
        $active_crops_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$buyer_id]);
        $notifications_count = $stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT b.*, a.crop_name, a.current_bid, a.status as auction_status
            FROM bids b
            JOIN auctions a ON b.auction_id = a.id
            WHERE b.buyer_id = ?
            ORDER BY b.id DESC LIMIT 4
        ");
        $stmt->execute([$buyer_id]);
        $recent_bids = $stmt->fetchAll();

        $stmt = $pdo->prepare("SELECT * FROM inquiries WHERE buyer_id = ? ORDER BY id DESC LIMIT 4");
        $stmt->execute([$buyer_id]);
        $recent_inquiries = $stmt->fetchAll();
    } catch (Exception $e) {}
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Top Bar -->
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 mb-4 border-bottom">
    <div>
      <span class="text-success fw-bold small"><i class="fa-solid fa-store me-1"></i> Wholesale Procurement Portal</span>
      <h2 class="fw-bold mb-0">Welcome, <?php echo htmlspecialchars($buyer_name); ?>!</h2>
      <p class="text-muted small mb-0">Browse fresh farm harvests, place competitive auction bids, and negotiate bulk supplies.</p>
    </div>
    <div class="mt-3 mt-md-0 d-flex gap-2">
      <a href="/buyer/marketplace.php" class="btn btn-success rounded-pill px-3"><i class="fa-solid fa-store me-1"></i> Browse Marketplace</a>
      <a href="/buyer/auctions.php" class="btn btn-warning rounded-pill px-3 text-dark fw-bold"><i class="fa-solid fa-gavel me-1"></i> Live Auctions</a>
    </div>
  </div>

  <!-- Metric Cards -->
  <div class="row g-3 mb-4">
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Marketplace Crops</span>
            <h3 class="fw-bold text-success mb-0"><?php echo $active_crops_count; ?></h3>
          </div>
          <div class="p-3 bg-success-subtle text-success rounded-circle">
            <i class="fa-solid fa-wheat-awn fs-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Auctions Participated</span>
            <h3 class="fw-bold text-warning mb-0"><?php echo $active_bids_count; ?></h3>
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
            <span class="text-muted small">Sent Inquiries</span>
            <h3 class="fw-bold text-primary mb-0"><?php echo $inquiries_count; ?></h3>
          </div>
          <div class="p-3 bg-primary-subtle text-primary rounded-circle">
            <i class="fa-solid fa-paper-plane fs-4"></i>
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

  <!-- Navigation Buttons -->
  <div class="card border-0 shadow-sm rounded-4 p-2 mb-4 bg-light">
    <div class="d-flex flex-wrap gap-2">
      <a href="/buyer/marketplace.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-store me-1"></i> Marketplace</a>
      <a href="/buyer/auctions.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-gavel me-1"></i> Live Auctions</a>
      <a href="/buyer/inquiries.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-comments me-1"></i> My Inquiries</a>
      <a href="/ai/comparison.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-camera me-1"></i> AI Vegetable Quality</a>
      <a href="/farmer/mandi_prices.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-chart-line me-1"></i> Benchmark Rates</a>
      <a href="/buyer/profile.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-id-card me-1"></i> Profile</a>
      <a href="/buyer/notifications.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-bell me-1"></i> Notifications</a>
    </div>
  </div>

  <div class="row g-4">
    <!-- Recent Bids -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">My Active Bids</h5>
          <a href="/buyer/auctions.php" class="small text-success fw-bold text-decoration-none">Explore Auctions</a>
        </div>
        <?php if (empty($recent_bids)): ?>
          <div class="text-center py-4 text-muted small">You haven't placed any bids yet.</div>
        <?php else: ?>
          <div class="list-group list-group-flush">
            <?php foreach ($recent_bids as $b): ?>
              <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <div>
                  <strong><?php echo htmlspecialchars($b['crop_name']); ?></strong><br>
                  <span class="small text-muted">My Bid: ₹<?php echo number_format($b['bid_amount']); ?>/Qtl</span>
                </div>
                <div class="text-end">
                  <span class="badge <?php echo $b['bid_amount'] >= $b['current_bid'] ? 'bg-success' : 'bg-warning text-dark'; ?> rounded-pill">
                    <?php echo $b['bid_amount'] >= $b['current_bid'] ? 'Highest Bidder' : 'Outbid'; ?>
                  </span>
                  <div class="small text-muted mt-1">Current: ₹<?php echo number_format($b['current_bid']); ?></div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>

    <!-- Sent Inquiries -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Recent Direct Inquiries</h5>
          <a href="/buyer/inquiries.php" class="small text-success fw-bold text-decoration-none">View All</a>
        </div>
        <?php if (empty($recent_inquiries)): ?>
          <div class="text-center py-4 text-muted small">No inquiries sent yet.</div>
        <?php else: ?>
          <div class="d-flex flex-column gap-2">
            <?php foreach ($recent_inquiries as $inq): ?>
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-dark small"><?php echo htmlspecialchars($inq['crop_name']); ?></strong>
                  <span class="badge <?php echo $inq['status'] === 'accepted' ? 'bg-success' : ($inq['status'] === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'); ?> rounded-pill small">
                    <?php echo strtoupper($inq['status']); ?>
                  </span>
                </div>
                <p class="small text-muted mb-0"><?php echo htmlspecialchars($inq['message']); ?></p>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
