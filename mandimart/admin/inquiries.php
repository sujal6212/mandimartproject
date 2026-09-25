<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$inquiries = [];
if (isset($pdo)) {
    $inquiries = $pdo->query("
        SELECT i.*, b.name as buyer_name, f.name as farmer_name, c.name as crop_name
        FROM inquiries i
        JOIN users b ON i.buyer_id = b.id
        JOIN users f ON i.farmer_id = f.id
        JOIN crops c ON i.crop_id = c.id
        ORDER BY i.id DESC
    ")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">💬 Marketplace Inquiries Supervision</h3>
      <p class="text-muted small mb-0">Direct B2B negotiations between buyers and farmers.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Buyer</th>
            <th>Farmer</th>
            <th>Crop</th>
            <th>Quantity</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($inquiries as $i): ?>
            <tr>
              <td>#<?php echo $i['id']; ?></td>
              <td><strong><?php echo htmlspecialchars($i['buyer_name']); ?></strong></td>
              <td><?php echo htmlspecialchars($i['farmer_name']); ?></td>
              <td><?php echo htmlspecialchars($i['crop_name']); ?></td>
              <td><?php echo htmlspecialchars($i['quantity']); ?> Qtl</td>
              <td style="max-width: 250px;"><?php echo htmlspecialchars($i['message']); ?></td>
              <td>
                <span class="badge <?php echo $i['status'] === 'accepted' ? 'bg-success' : ($i['status'] === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'); ?> rounded-pill">
                  <?php echo strtoupper($i['status']); ?>
                </span>
              </td>
              <td><?php echo date('d M Y, h:i A', strtotime($i['created_at'])); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
