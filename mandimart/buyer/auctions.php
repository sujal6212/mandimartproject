<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$auctions = [];
if (isset($pdo)) {
    $stmt = $pdo->query("
        SELECT a.*, u.name as farmer_name, u.location as farmer_loc
        FROM auctions a
        JOIN users u ON a.farmer_id = u.id
        WHERE a.status = 'active'
        ORDER BY a.id DESC
    ");
    $auctions = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
    <div>
      <span class="text-warning fw-bold small"><i class="fa-solid fa-gavel me-1"></i> Transparent Electronic Bidding</span>
      <h2 class="fw-bold mb-0">Live Agricultural Produce Auctions</h2>
      <p class="text-muted small mb-0">Place competitive bids in real time on wholesale farm lots.</p>
    </div>
    <div class="mt-3 mt-md-0">
      <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">
        <i class="fa-solid fa-circle text-danger me-1 animate-pulse"></i> LIVE BIDDING ACTIVE
      </span>
    </div>
  </div>

  <div class="row g-4">
    <?php if (empty($auctions)): ?>
      <div class="col-12 text-center py-5 text-muted">
        <i class="fa-solid fa-gavel fs-1 mb-2"></i>
        <h5>No active auctions currently running.</h5>
        <p class="small">Check back soon or browse the marketplace for instant listings.</p>
        <a href="/buyer/marketplace.php" class="btn btn-success btn-sm rounded-pill">Explore Marketplace</a>
      </div>
    <?php else: ?>
      <?php foreach ($auctions as $auc): ?>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm rounded-4 overflow-hidden position-relative">
            <!-- Grade Badge -->
            <div class="position-absolute top-0 end-0 m-3 z-1">
              <span class="badge bg-warning text-dark fw-bold">Grade <?php echo htmlspecialchars($auc['grade']); ?></span>
            </div>

            <div class="bg-light d-flex align-items-center justify-content-center p-4" style="height: 170px;">
              <i class="fa-solid fa-gavel text-warning" style="font-size: 3rem;"></i>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-muted small"><i class="fa-solid fa-tractor me-1"></i> <?php echo htmlspecialchars($auc['farmer_name']); ?></span>
                <span class="badge bg-light text-dark border">Lot #<?php echo $auc['id']; ?></span>
              </div>

              <h5 class="fw-bold mb-2"><?php echo htmlspecialchars($auc['crop_name']); ?></h5>
              <div class="small text-muted mb-3">Lot Size: <strong><?php echo htmlspecialchars($auc['quantity'] . ' ' . $auc['unit']); ?></strong></div>

              <div class="bg-light p-3 rounded-3 mb-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Opening Reserve:</span>
                  <span>₹<?php echo number_format($auc['base_price']); ?></span>
                </div>
                <div class="d-flex justify-content-between align-items-baseline">
                  <span class="small fw-bold text-dark">Current Top Bid:</span>
                  <span class="fw-bold text-success fs-5">₹<?php echo number_format($auc['current_bid']); ?> <span class="fs-6 text-muted">/ <?php echo htmlspecialchars($auc['unit']); ?></span></span>
                </div>
              </div>

              <!-- End Time / Countdown -->
              <div class="small text-muted mb-3 d-flex align-items-center gap-1">
                <i class="fa-regular fa-clock text-warning"></i>
                <span>Ends: <strong><?php echo date('d M, h:i A', strtotime($auc['end_time'])); ?></strong></span>
              </div>

              <div class="mt-auto">
                <a href="/buyer/auction_details.php?id=<?php echo $auc['id']; ?>" class="btn btn-warning text-dark fw-bold w-100 py-2 rounded-pill">
                  <i class="fa-solid fa-gavel me-1"></i> Place Bid Now
                </a>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
