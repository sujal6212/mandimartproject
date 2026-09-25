<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmers = [];
if (isset($pdo)) {
    $farmers = $pdo->query("SELECT * FROM users WHERE role = 'farmer' ORDER BY id DESC")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">👨‍🌾 Registered Farmers</h3>
      <p class="text-muted small mb-0">Verified producers connected to MandiMart.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Farmer Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Village / District / State</th>
            <th>Registered Date</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($farmers as $f): ?>
            <tr>
              <td>#<?php echo $f['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($f['name']); ?></strong></td>
              <td><?php echo htmlspecialchars($f['phone']); ?></td>
              <td><?php echo htmlspecialchars($f['email']); ?></td>
              <td><?php echo htmlspecialchars(($f['village'] ? $f['village'] . ', ' : '') . $f['district'] . ', ' . $f['state']); ?></td>
              <td><?php echo date('d M Y', strtotime($f['created_at'])); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
