<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$msg = '';

// Handle Accept / Reject
if (isset($_GET['action']) && isset($_GET['id'])) {
    $inq_id = intval($_GET['id']);
    $action = $_GET['action'];

    if (in_array($action, ['accepted', 'rejected']) && isset($pdo)) {
        $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ? AND farmer_id = ?");
        $stmt->execute([$action, $inq_id, $farmer_id]);

        // Get buyer info for notification
        $b_stmt = $pdo->prepare("SELECT buyer_id, crop_name FROM inquiries WHERE id = ?");
        $b_stmt->execute([$inq_id]);
        $inq_info = $b_stmt->fetch();

        if ($inq_info) {
            $status_txt = ucfirst($action);
            create_notification($pdo, $inq_info['buyer_id'], "Inquiry {$status_txt}", "Your inquiry for {$inq_info['crop_name']} has been {$action} by the farmer.");
        }
        $msg = "Inquiry marked as {$action}.";
    }
}

$inquiries = [];
if (isset($pdo)) {
    $stmt = $pdo->prepare("
        SELECT i.*, u.name as buyer_name, u.phone as buyer_phone, u.email as buyer_email, u.business_type
        FROM inquiries i
        JOIN users u ON i.buyer_id = u.id
        WHERE i.farmer_id = ?
        ORDER BY i.id DESC
    ");
    $stmt->execute([$farmer_id]);
    $inquiries = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">💬 Buyer Inquiries</h3>
      <p class="text-muted small mb-0">Direct messages and purchase requests from verified wholesale buyers.</p>
    </div>
  </div>

  <?php if ($msg): ?>
    <div class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($msg); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small">
          <tr>
            <th>Buyer / Company</th>
            <th>Contact</th>
            <th>Crop Requested</th>
            <th>Quantity</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="small">
          <?php if (empty($inquiries)): ?>
            <tr>
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="fa-solid fa-comments fs-2 mb-2 text-muted"></i><br>
                No buyer inquiries received yet. Active crop listings will appear in buyer search results.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($inquiries as $inq): ?>
              <tr>
                <td>
                  <strong class="text-dark"><?php echo htmlspecialchars($inq['buyer_name']); ?></strong><br>
                  <small class="text-muted"><?php echo htmlspecialchars($inq['business_type'] ?? 'Wholesaler'); ?></small>
                </td>
                <td>
                  <a href="tel:<?php echo htmlspecialchars($inq['buyer_phone']); ?>" class="text-decoration-none text-success fw-bold">
                    <i class="fa-solid fa-phone me-1"></i><?php echo htmlspecialchars($inq['buyer_phone']); ?>
                  </a><br>
                  <small class="text-muted"><?php echo htmlspecialchars($inq['buyer_email']); ?></small>
                </td>
                <td><span class="fw-bold"><?php echo htmlspecialchars($inq['crop_name']); ?></span></td>
                <td><?php echo htmlspecialchars($inq['quantity']); ?> Quintals</td>
                <td style="max-width: 250px;">
                  <span class="text-secondary"><?php echo htmlspecialchars($inq['message']); ?></span>
                  <div class="text-muted" style="font-size: 11px;"><?php echo date('d M Y, h:i A', strtotime($inq['created_at'])); ?></div>
                </td>
                <td>
                  <span class="badge <?php echo $inq['status'] === 'accepted' ? 'bg-success' : ($inq['status'] === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'); ?> rounded-pill">
                    <?php echo strtoupper($inq['status']); ?>
                  </span>
                </td>
                <td>
                  <?php if ($inq['status'] === 'pending'): ?>
                    <div class="d-flex gap-1">
                      <a href="inquiries.php?action=accepted&id=<?php echo $inq['id']; ?>" class="btn btn-sm btn-success rounded-pill px-2 py-1"><i class="fa-solid fa-check"></i> Accept</a>
                      <a href="inquiries.php?action=rejected&id=<?php echo $inq['id']; ?>" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"><i class="fa-solid fa-xmark"></i> Reject</a>
                    </div>
                  <?php else: ?>
                    <span class="text-muted small">Responded</span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
