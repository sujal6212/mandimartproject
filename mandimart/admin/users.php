<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$msg = '';

if (isset($_GET['delete_id']) && isset($pdo)) {
    $del = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
    $del->execute([intval($_GET['delete_id'])]);
    $msg = 'User account removed.';
}

$users = [];
if (isset($pdo)) {
    $users = $pdo->query("SELECT * FROM users ORDER BY id DESC")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">👥 User Management</h3>
      <p class="text-muted small mb-0">Registered farmers, wholesale buyers, and platform administrators.</p>
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
            <th>Name</th>
            <th>Role</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Location</th>
            <th>Date Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($users as $u): ?>
            <tr>
              <td>#<?php echo $u['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($u['name']); ?></strong></td>
              <td>
                <span class="badge <?php echo $u['role'] === 'farmer' ? 'bg-success' : ($u['role'] === 'buyer' ? 'bg-primary' : 'bg-danger'); ?> rounded-pill">
                  <?php echo strtoupper($u['role']); ?>
                </span>
              </td>
              <td><?php echo htmlspecialchars($u['phone']); ?></td>
              <td><?php echo htmlspecialchars($u['email']); ?></td>
              <td><?php echo htmlspecialchars(($u['district'] ?? '') . ', ' . ($u['state'] ?? '')); ?></td>
              <td><?php echo date('d M Y', strtotime($u['created_at'])); ?></td>
              <td>
                <?php if ($u['role'] !== 'admin'): ?>
                  <a href="users.php?delete_id=<?php echo $u['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onclick="return confirm('Permanently delete this user account?');">
                    <i class="fa-solid fa-trash"></i>
                  </a>
                <?php else: ?>
                  <span class="text-muted">Protected</span>
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
