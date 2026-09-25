<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$auctions = [];

if (isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM auctions WHERE farmer_id = ? ORDER BY id DESC");
    $stmt->execute([$farmer_id]);
    $auctions = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🔨 My Crop Auctions</h3>
      <p class="text-muted small mb-0">Track real-time bids placed on your lots.</p>
    </div>
    <a href="/farmer/create_auction.php" class="btn btn-warning rounded-pill px-4 text-dark fw-bold"><i class="fa-solid fa-plus me-1"></i> Start New Auction</a>
  </div>

  <div class="row g-4">
    <?php if (empty($auctions)): ?>
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-gavel fs-1 text-muted mb-3"></i>
        <h5>No auctions launched yet</h5>
        <p class="text-muted">Start an auction with a reserve base price to let verified buyers compete for your harvest.</p>
        <a href="/farmer/create_auction.php" class="btn btn-warning text-dark fw-bold rounded-pill">Create First Auction</a>
      </div>
    <?php else: ?>
      <?php foreach ($auctions as $auc): ?>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm rounded-4 overflow-hidden position-relative">
            <div class="position-absolute top-0 end-0 m-3">
              <span class="badge <?php echo $auc['status'] === 'active' ? 'bg-success' : 'bg-secondary'; ?> rounded-pill">
                <?php echo strtoupper($auc['status']); ?>
              </span>
            </div>

            <div class="bg-light d-flex align-items-center justify-content-center p-4" style="height: 160px;">
              <i class="fa-solid fa-gavel text-warning fs-1"></i>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-warning text-dark">Lot #<?php echo $auc['id']; ?></span>
                <span class="badge bg-light text-muted border">Grade <?php echo htmlspecialchars($auc['grade']); ?></span>
              </div>

              <h5 class="fw-bold mb-2"><?php echo htmlspecialchars($auc['crop_name']); ?></h5>
              <div class="small text-muted mb-3">Lot Size: <strong><?php echo htmlspecialchars($auc['quantity'] . ' ' . $auc['unit']); ?></strong></div>

              <div class="bg-light p-3 rounded-3 mb-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Base Price:</span>
                  <span>₹<?php echo number_format($auc['base_price']); ?></span>
                </div>
                <div class="d-flex justify-content-between align-items-baseline">
                  <span class="small fw-bold text-dark">Current Top Bid:</span>
                  <span class="fw-bold text-success fs-5">₹<?php echo number_format($auc['current_bid']); ?></span>
                </div>
              </div>

              <div class="small text-muted mb-3">
                <i class="fa-regular fa-clock me-1 text-warning"></i> Ends: <strong><?php echo date('d M, h:i A', strtotime($auc['end_time'])); ?></strong>
              </div>

              <div class="mt-auto">
                <a href="/buyer/auction_details.php?id=<?php echo $auc['id']; ?>" class="btn btn-sm btn-outline-success w-100 rounded-pill">View Live Bid Log</a>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
