<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$msg = '';

if (isset($_GET['cancel_id']) && isset($pdo)) {
    $c = $pdo->prepare("UPDATE auctions SET status = 'cancelled' WHERE id = ?");
    $c->execute([intval($_GET['cancel_id'])]);
    $msg = 'Auction lot cancelled.';
}

$auctions = [];
if (isset($pdo)) {
    $auctions = $pdo->query("
        SELECT a.*, u.name as farmer_name
        FROM auctions a
        JOIN users u ON a.farmer_id = u.id
        ORDER BY a.id DESC
    ")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🔨 Auction Supervision</h3>
      <p class="text-muted small mb-0">Monitor active and concluded crop auctions across the platform.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <?php if ($msg): ?><div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>Lot #</th>
            <th>Crop</th>
            <th>Farmer</th>
            <th>Quantity</th>
            <th>Reserve Base</th>
            <th>Current Bid</th>
            <th>Status</th>
            <th>Closes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($auctions as $a): ?>
            <tr>
              <td>#<?php echo $a['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($a['crop_name']); ?></strong></td>
              <td><?php echo htmlspecialchars($a['farmer_name']); ?></td>
              <td><?php echo htmlspecialchars($a['quantity'] . ' ' . $a['unit']); ?></td>
              <td>₹<?php echo number_format($a['base_price']); ?></td>
              <td class="text-success fw-bold">₹<?php echo number_format($a['current_bid']); ?></td>
              <td>
                <span class="badge <?php echo $a['status'] === 'active' ? 'bg-success' : 'bg-secondary'; ?> rounded-pill">
                  <?php echo strtoupper($a['status']); ?>
                </span>
              </td>
              <td><?php echo date('d M, h:i A', strtotime($a['end_time'])); ?></td>
              <td>
                <?php if ($a['status'] === 'active'): ?>
                  <a href="auctions.php?cancel_id=<?php echo $a['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onclick="return confirm('Cancel this active auction?');">Cancel</a>
                <?php else: ?>
                  <span class="text-muted">Concluded</span>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
