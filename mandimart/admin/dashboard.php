<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$total_users = 0;
$total_farmers = 0;
$total_buyers = 0;
$total_crops = 0;
$total_auctions = 0;
$total_mandis = 0;
$total_inquiries = 0;
$recent_crops = [];
$recent_bids = [];

if (isset($pdo)) {
    try {
        $total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $total_farmers = $pdo->query("SELECT COUNT(*) FROM users WHERE role='farmer'")->fetchColumn();
        $total_buyers = $pdo->query("SELECT COUNT(*) FROM users WHERE role='buyer'")->fetchColumn();
        $total_crops = $pdo->query("SELECT COUNT(*) FROM crops")->fetchColumn();
        $total_auctions = $pdo->query("SELECT COUNT(*) FROM auctions")->fetchColumn();
        $total_mandis = $pdo->query("SELECT COUNT(*) FROM mandis")->fetchColumn();
        $total_inquiries = $pdo->query("SELECT COUNT(*) FROM inquiries")->fetchColumn();

        $recent_crops = $pdo->query("SELECT c.*, u.name as farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id ORDER BY c.id DESC LIMIT 5")->fetchAll();
        $recent_bids = $pdo->query("SELECT b.*, u.name as buyer_name, a.crop_name FROM bids b JOIN users u ON b.buyer_id = u.id JOIN auctions a ON b.auction_id = a.id ORDER BY b.id DESC LIMIT 5")->fetchAll();
    } catch (Exception $e) {}
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Top Admin Bar -->
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 mb-4 border-bottom">
    <div>
      <span class="badge bg-danger text-white px-3 py-1 rounded-pill small mb-1">
        <i class="fa-solid fa-shield-halved me-1"></i> MandiMart Administrator
      </span>
      <h2 class="fw-bold mb-0">Platform Overview & Management</h2>
      <p class="text-muted small mb-0">National Agricultural Marketplace Control Center</p>
    </div>
    <div class="mt-3 mt-md-0 d-flex gap-2">
      <a href="/admin/mandi_prices.php" class="btn btn-success btn-sm rounded-pill"><i class="fa-solid fa-plus me-1"></i> Update Mandi Price</a>
      <a href="/admin/reports.php" class="btn btn-outline-dark btn-sm rounded-pill"><i class="fa-solid fa-chart-pie me-1"></i> Analytics & Reports</a>
    </div>
  </div>

  <!-- Metric Counters -->
  <div class="row g-3 mb-4">
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <span class="text-muted small">Total Farmers</span>
        <h3 class="fw-bold text-success mb-0"><?php echo $total_farmers; ?></h3>
        <small class="text-muted"><a href="/admin/farmers.php" class="text-decoration-none">Manage Farmers &rarr;</a></small>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <span class="text-muted small">Wholesale Buyers</span>
        <h3 class="fw-bold text-primary mb-0"><?php echo $total_buyers; ?></h3>
        <small class="text-muted"><a href="/admin/buyers.php" class="text-decoration-none">Manage Buyers &rarr;</a></small>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <span class="text-muted small">Listed Crops</span>
        <h3 class="fw-bold text-warning mb-0"><?php echo $total_crops; ?></h3>
        <small class="text-muted"><a href="/admin/crops.php" class="text-decoration-none">Review Crops &rarr;</a></small>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <span class="text-muted small">Tracked Mandis</span>
        <h3 class="fw-bold text-danger mb-0"><?php echo $total_mandis; ?></h3>
        <small class="text-muted"><a href="/admin/mandis.php" class="text-decoration-none">Manage Mandis &rarr;</a></small>
      </div>
    </div>
  </div>

  <!-- Quick Admin Nav -->
  <div class="card border-0 shadow-sm rounded-4 p-2 mb-4 bg-light">
    <div class="d-flex flex-wrap gap-2">
      <a href="/admin/users.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-users me-1"></i> All Users</a>
      <a href="/admin/crops.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-wheat-awn me-1"></i> Crops</a>
      <a href="/admin/mandis.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-location-dot me-1"></i> Mandis</a>
      <a href="/admin/mandi_prices.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-chart-line me-1"></i> Mandi Prices</a>
      <a href="/admin/auctions.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-gavel me-1"></i> Auctions</a>
      <a href="/admin/bids.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-list-ol me-1"></i> Bids</a>
      <a href="/admin/inquiries.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-comments me-1"></i> Inquiries</a>
      <a href="/admin/reports.php" class="btn btn-white bg-white border btn-sm rounded-pill"><i class="fa-solid fa-file-lines me-1"></i> Reports</a>
    </div>
  </div>

  <div class="row g-4">
    <!-- Recent Crops Registered -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <h5 class="fw-bold mb-3">Recently Registered Crop Listings</h5>
        <div class="table-responsive">
          <table class="table table-sm align-middle small">
            <thead class="table-light">
              <tr>
                <th>Crop</th>
                <th>Farmer</th>
                <th>Price</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($recent_crops as $c): ?>
                <tr>
                  <td><strong><?php echo htmlspecialchars($c['name']); ?></strong></td>
                  <td><?php echo htmlspecialchars($c['farmer_name']); ?></td>
                  <td class="text-success fw-bold">₹<?php echo number_format($c['expected_price']); ?></td>
                  <td><span class="badge bg-warning text-dark"><?php echo htmlspecialchars($c['grade']); ?></span></td>
                  <td><span class="badge bg-success rounded-pill"><?php echo htmlspecialchars($c['status']); ?></span></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Recent Bids Placed -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <h5 class="fw-bold mb-3">Recent Auction Bids</h5>
        <div class="table-responsive">
          <table class="table table-sm align-middle small">
            <thead class="table-light">
              <tr>
                <th>Auction Lot</th>
                <th>Buyer</th>
                <th>Bid Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($recent_bids as $b): ?>
                <tr>
                  <td><strong><?php echo htmlspecialchars($b['crop_name']); ?></strong></td>
                  <td><?php echo htmlspecialchars($b['buyer_name']); ?></td>
                  <td class="text-success fw-bold">₹<?php echo number_format($b['bid_amount']); ?></td>
                  <td class="text-muted"><?php echo date('d M, h:i A', strtotime($b['created_at'])); ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
