<?php
require_once __DIR__ . '/../includes/buyer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$buyer_id = $_SESSION['user_id'];

if (isset($_GET['mark_all']) && isset($pdo)) {
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$buyer_id]);
}

$notifications = [];
if (isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$buyer_id]);
    $notifications = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🔔 Notifications & Alerts</h3>
      <p class="text-muted small mb-0">Outbid alerts, inquiry updates, and trade confirmations.</p>
    </div>
    <a href="notifications.php?mark_all=1" class="btn btn-outline-secondary btn-sm rounded-pill">Mark All as Read</a>
  </div>

  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-4 p-3">
        <?php if (empty($notifications)): ?>
          <div class="text-center py-5 text-muted">
            <i class="fa-regular fa-bell-slash fs-1 mb-2"></i>
            <p>No notifications yet.</p>
          </div>
        <?php else: ?>
          <div class="list-group list-group-flush">
            <?php foreach ($notifications as $n): ?>
              <div class="list-group-item d-flex justify-content-between align-items-start py-3 <?php echo !$n['is_read'] ? 'bg-light rounded-3 my-1' : ''; ?>">
                <div class="ms-2 me-auto">
                  <div class="fw-bold <?php echo !$n['is_read'] ? 'text-success' : 'text-dark'; ?>">
                    <?php echo htmlspecialchars($n['title']); ?>
                  </div>
                  <p class="mb-1 small text-secondary"><?php echo htmlspecialchars($n['message']); ?></p>
                  <small class="text-muted"><?php echo date('d M Y, h:i A', strtotime($n['created_at'])); ?></small>
                </div>
                <?php if (!$n['is_read']): ?>
                  <span class="badge bg-success rounded-pill">New</span>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
