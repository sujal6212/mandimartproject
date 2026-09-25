<?php
require_once __DIR__ . '/../includes/buyer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$buyer_id = $_SESSION['user_id'];
$inquiries = [];

if (isset($pdo)) {
    $stmt = $pdo->prepare("
        SELECT i.*, u.name as farmer_name, u.phone as farmer_phone
        FROM inquiries i
        JOIN users u ON i.farmer_id = u.id
        WHERE i.buyer_id = ?
        ORDER BY i.id DESC
    ");
    $stmt->execute([$buyer_id]);
    $inquiries = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">📨 My Sent Inquiries</h3>
      <p class="text-muted small mb-0">Track purchase inquiries submitted to farmers.</p>
    </div>
    <a href="/buyer/marketplace.php" class="btn btn-success btn-sm rounded-pill"><i class="fa-solid fa-store me-1"></i> Browse Marketplace</a>
  </div>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small">
          <tr>
            <th>Farmer</th>
            <th>Contact</th>
            <th>Crop</th>
            <th>Quantity</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date Sent</th>
          </tr>
        </thead>
        <tbody class="small">
          <?php if (empty($inquiries)): ?>
            <tr><td colspan="7" class="text-center py-5 text-muted">No inquiries sent yet.</td></tr>
          <?php else: ?>
            <?php foreach ($inquiries as $inq): ?>
              <tr>
                <td><strong><?php echo htmlspecialchars($inq['farmer_name']); ?></strong></td>
                <td>
                  <a href="tel:<?php echo htmlspecialchars($inq['farmer_phone']); ?>" class="text-decoration-none text-success">
                    <i class="fa-solid fa-phone me-1"></i><?php echo htmlspecialchars($inq['farmer_phone']); ?>
                  </a>
                </td>
                <td class="fw-bold"><?php echo htmlspecialchars($inq['crop_name']); ?></td>
                <td><?php echo htmlspecialchars($inq['quantity']); ?> Quintals</td>
                <td style="max-width: 260px;"><?php echo htmlspecialchars($inq['message']); ?></td>
                <td>
                  <span class="badge <?php echo $inq['status'] === 'accepted' ? 'bg-success' : ($inq['status'] === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'); ?> rounded-pill">
                    <?php echo strtoupper($inq['status']); ?>
                  </span>
                </td>
                <td class="text-muted"><?php echo date('d M Y, h:i A', strtotime($inq['created_at'])); ?></td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
