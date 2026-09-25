<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$crop_id = intval($_GET['id'] ?? 0);
$error = '';
$success = '';

if (isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM crops WHERE id = ? AND farmer_id = ?");
    $stmt->execute([$crop_id, $farmer_id]);
    $crop = $stmt->fetch();

    if (!$crop) {
        header("Location: /farmer/my_crops.php?error=not_found");
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $quantity = floatval($_POST['quantity'] ?? 0);
    $unit = trim($_POST['unit'] ?? 'Quintal');
    $grade = trim($_POST['grade'] ?? 'A');
    $expected_price = floatval($_POST['expected_price'] ?? 0);
    $location = trim($_POST['location'] ?? 'Haryana');
    $description = trim($_POST['description'] ?? '');

    if (empty($name) || $quantity <= 0 || $expected_price <= 0) {
        $error = 'Please fill all required fields properly.';
    } else {
        if (isset($pdo)) {
            $upd = $pdo->prepare("
                UPDATE crops
                SET name = ?, quantity = ?, unit = ?, grade = ?, expected_price = ?, location = ?, description = ?
                WHERE id = ? AND farmer_id = ?
            ");
            $res = $upd->execute([$name, $quantity, $unit, $grade, $expected_price, $location, $description, $crop_id, $farmer_id]);

            if ($res) {
                $success = 'Crop listing updated successfully!';
                // Refresh data
                $stmt = $pdo->prepare("SELECT * FROM crops WHERE id = ?");
                $stmt->execute([$crop_id]);
                $crop = $stmt->fetch();
            } else {
                $error = 'Failed to update crop.';
            }
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h4 class="fw-bold mb-0">✏️ Edit Crop Listing</h4>
          <a href="/farmer/my_crops.php" class="btn btn-outline-light btn-sm rounded-pill">&larr; Back to My Crops</a>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>
          <?php if ($success): ?>
            <div class="alert alert-success py-2 small"><?php echo htmlspecialchars($success); ?></div>
          <?php endif; ?>

          <form action="edit_crop.php?id=<?php echo $crop_id; ?>" method="POST">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small fw-bold">Crop Name *</label>
                <input type="text" name="name" class="form-control rounded-3" value="<?php echo htmlspecialchars($crop['name']); ?>" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Quality Grade *</label>
                <select name="grade" class="form-select rounded-3">
                  <option value="A+" <?php if ($crop['grade'] === 'A+') echo 'selected'; ?>>Grade A+</option>
                  <option value="A" <?php if ($crop['grade'] === 'A') echo 'selected'; ?>>Grade A</option>
                  <option value="B" <?php if ($crop['grade'] === 'B') echo 'selected'; ?>>Grade B</option>
                  <option value="C" <?php if ($crop['grade'] === 'C') echo 'selected'; ?>>Grade C</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Available Quantity *</label>
                <input type="number" step="0.1" name="quantity" class="form-control rounded-3" value="<?php echo htmlspecialchars($crop['quantity']); ?>" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Unit *</label>
                <select name="unit" class="form-select rounded-3">
                  <option value="Quintal" <?php if ($crop['unit'] === 'Quintal') echo 'selected'; ?>>Quintal</option>
                  <option value="Kg" <?php if ($crop['unit'] === 'Kg') echo 'selected'; ?>>Kg</option>
                  <option value="Ton" <?php if ($crop['unit'] === 'Ton') echo 'selected'; ?>>Ton</option>
                  <option value="Bags (50kg)" <?php if ($crop['unit'] === 'Bags (50kg)') echo 'selected'; ?>>Bags (50kg)</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Expected Price (₹) *</label>
                <input type="number" step="1" name="expected_price" class="form-control rounded-3" value="<?php echo htmlspecialchars($crop['expected_price']); ?>" required>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Farm / Storage Location *</label>
                <input type="text" name="location" class="form-control rounded-3" value="<?php echo htmlspecialchars($crop['location']); ?>" required>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Produce Description</label>
                <textarea name="description" class="form-control rounded-3" rows="3"><?php echo htmlspecialchars($crop['description']); ?></textarea>
              </div>
            </div>

            <div class="mt-4 d-flex gap-2">
              <button type="submit" class="btn btn-success flex-fill py-2 rounded-pill fw-bold">Save Changes</button>
              <a href="/farmer/my_crops.php" class="btn btn-outline-secondary py-2 px-4 rounded-pill">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
