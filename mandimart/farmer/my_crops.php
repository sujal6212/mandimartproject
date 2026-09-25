<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$crops = [];
$msg = '';

// Handle Delete or Status Toggle
if (isset($_GET['action']) && isset($_GET['id'])) {
    $crop_id = intval($_GET['id']);
    if (isset($pdo)) {
        if ($_GET['action'] === 'delete') {
            $del = $pdo->prepare("DELETE FROM crops WHERE id = ? AND farmer_id = ?");
            $del->execute([$crop_id, $farmer_id]);
            $msg = 'Crop listing deleted successfully.';
        } elseif ($_GET['action'] === 'toggle') {
            $tog = $pdo->prepare("UPDATE crops SET status = IF(status='active', 'sold', 'active') WHERE id = ? AND farmer_id = ?");
            $tog->execute([$crop_id, $farmer_id]);
            $msg = 'Crop status updated successfully.';
        }
    }
}

if (isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM crops WHERE farmer_id = ? ORDER BY id DESC");
    $stmt->execute([$farmer_id]);
    $crops = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">🌾 My Crop Inventory</h3>
      <p class="text-muted small mb-0">View, edit, or mark crops as sold.</p>
    </div>
    <a href="/farmer/add_crop.php" class="btn btn-success rounded-pill px-4"><i class="fa-solid fa-plus me-1"></i> Add New Crop</a>
  </div>

  <?php if ($msg): ?>
    <div class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($msg); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>

  <div class="row g-4">
    <?php if (empty($crops)): ?>
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-wheat-awn fs-1 text-muted mb-3"></i>
        <h5>No crops listed yet</h5>
        <p class="text-muted">Start connecting with buyers today by listing your available harvest.</p>
        <a href="/farmer/add_crop.php" class="btn btn-success rounded-pill">List Your First Crop</a>
      </div>
    <?php else: ?>
      <?php foreach ($crops as $crop): ?>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm rounded-4 overflow-hidden position-relative">
            <div class="position-absolute top-0 end-0 m-3">
              <span class="badge <?php echo $crop['status'] === 'active' ? 'bg-success' : 'bg-secondary'; ?> rounded-pill">
                <?php echo strtoupper($crop['status']); ?>
              </span>
            </div>
            <div class="bg-light d-flex align-items-center justify-content-center p-4" style="height: 180px;">
              <i class="fa-solid fa-seedling text-success fs-1"></i>
            </div>
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-warning text-dark">Grade <?php echo htmlspecialchars($crop['grade']); ?></span>
                <span class="text-muted small"><i class="fa-solid fa-star text-warning"></i> <?php echo htmlspecialchars($crop['rating']); ?></span>
              </div>
              <h5 class="fw-bold mb-1"><?php echo htmlspecialchars($crop['name']); ?></h5>
              <div class="text-success fw-bold fs-5 mb-2"><?php echo format_currency($crop['expected_price']); ?> <span class="fs-6 text-muted font-normal">/ <?php echo htmlspecialchars($crop['unit']); ?></span></div>
              <p class="small text-muted mb-3 flex-grow-1"><?php echo htmlspecialchars(substr($crop['description'], 0, 95)); ?>...</p>

              <div class="d-flex justify-content-between text-muted small border-top pt-2 mb-3">
                <span>Quantity: <strong><?php echo htmlspecialchars($crop['quantity'] . ' ' . $crop['unit']); ?></strong></span>
                <span><i class="fa-solid fa-location-dot me-1"></i><?php echo htmlspecialchars($crop['location']); ?></span>
              </div>

              <div class="d-flex gap-2">
                <a href="/farmer/edit_crop.php?id=<?php echo $crop['id']; ?>" class="btn btn-sm btn-outline-primary flex-fill rounded-pill"><i class="fa-solid fa-pen me-1"></i> Edit</a>
                <a href="my_crops.php?action=toggle&id=<?php echo $crop['id']; ?>" class="btn btn-sm btn-outline-secondary flex-fill rounded-pill">
                  <?php echo $crop['status'] === 'active' ? 'Mark Sold' : 'Reactivate'; ?>
                </a>
                <a href="my_crops.php?action=delete&id=<?php echo $crop['id']; ?>" class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="return confirm('Are you sure you want to delete this crop listing?');">
                  <i class="fa-solid fa-trash"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
