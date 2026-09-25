<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$buyers = [];
if (isset($pdo)) {
    $buyers = $pdo->query("SELECT * FROM users WHERE role = 'buyer' ORDER BY id DESC")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🏢 Registered Wholesale Buyers</h3>
      <p class="text-muted small mb-0">Verified wholesale traders, food processors, and institutional buyers.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Company / Buyer Name</th>
            <th>Contact Person</th>
            <th>Business Type</th>
            <th>Mobile</th>
            <th>Location</th>
            <th>Registered Date</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($buyers as $b): ?>
            <tr>
              <td>#<?php echo $b['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($b['name']); ?></strong></td>
              <td><?php echo htmlspecialchars($b['contact_person'] ?? '-'); ?></td>
              <td><span class="badge bg-light text-dark border"><?php echo htmlspecialchars($b['business_type'] ?? 'Wholesaler'); ?></span></td>
              <td><?php echo htmlspecialchars($b['phone']); ?></td>
              <td><?php echo htmlspecialchars($b['district'] . ', ' . $b['state']); ?></td>
              <td><?php echo date('d M Y', strtotime($b['created_at'])); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
