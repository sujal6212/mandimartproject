<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$bids = [];
if (isset($pdo)) {
    $bids = $pdo->query("
        SELECT b.*, u.name as buyer_name, a.crop_name, a.current_bid
        FROM bids b
        JOIN users u ON b.buyer_id = u.id
        JOIN auctions a ON b.auction_id = a.id
        ORDER BY b.id DESC
    ")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🏷️ All Auction Bids Log</h3>
      <p class="text-muted small mb-0">Audit trail of all bids submitted on competitive lots.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>Bid ID</th>
            <th>Auction Lot</th>
            <th>Buyer Name</th>
            <th>Bid Amount</th>
            <th>Lot Current Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($bids as $b): ?>
            <tr>
              <td>#<?php echo $b['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($b['crop_name']); ?></strong> (Lot #<?php echo $b['auction_id']; ?>)</td>
              <td><?php echo htmlspecialchars($b['buyer_name']); ?></td>
              <td class="text-success fw-bold">₹<?php echo number_format($b['bid_amount']); ?></td>
              <td>Top: ₹<?php echo number_format($b['current_bid']); ?></td>
              <td><?php echo date('d M Y, h:i:s A', strtotime($b['created_at'])); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
