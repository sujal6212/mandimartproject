<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$msg = '';

if (isset($_GET['delete_id']) && isset($pdo)) {
    $del = $pdo->prepare("DELETE FROM crops WHERE id = ?");
    $del->execute([intval($_GET['delete_id'])]);
    $msg = 'Crop listing removed from marketplace.';
}

$crops = [];
if (isset($pdo)) {
    $crops = $pdo->query("
        SELECT c.*, u.name as farmer_name, u.phone as farmer_phone
        FROM crops c
        JOIN users u ON c.farmer_id = u.id
        ORDER BY c.id DESC
    ")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🌱 Crop Moderation</h3>
      <p class="text-muted small mb-0">Review, moderate, and manage farmer crop listings.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <?php if ($msg): ?><div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Crop</th>
            <th>Farmer</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Grade</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($crops as $c): ?>
            <tr>
              <td>#<?php echo $c['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($c['name']); ?></strong></td>
              <td><?php echo htmlspecialchars($c['farmer_name']); ?></td>
              <td><?php echo htmlspecialchars($c['quantity'] . ' ' . $c['unit']); ?></td>
              <td class="text-success fw-bold">₹<?php echo number_format($c['expected_price']); ?></td>
              <td><span class="badge bg-warning text-dark"><?php echo htmlspecialchars($c['grade']); ?></span></td>
              <td><?php echo htmlspecialchars($c['location']); ?></td>
              <td><span class="badge bg-success rounded-pill"><?php echo htmlspecialchars($c['status']); ?></span></td>
              <td>
                <a href="crops.php?delete_id=<?php echo $c['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onclick="return confirm('Remove crop listing?');">
                  <i class="fa-solid fa-trash"></i>
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
