<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$farmer_name = $_SESSION['user_name'];
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $quantity = floatval($_POST['quantity'] ?? 0);
    $unit = trim($_POST['unit'] ?? 'Quintal');
    $grade = trim($_POST['grade'] ?? 'A');
    $expected_price = floatval($_POST['expected_price'] ?? 0);
    $location = trim($_POST['location'] ?? 'Haryana');
    $description = trim($_POST['description'] ?? '');

    if (empty($name) || $quantity <= 0 || $expected_price <= 0) {
        $error = 'Please enter valid crop name, quantity, and expected price.';
    } else {
        $image_path = 'uploads/crops/default_crop.jpg';

        // Image upload handling
        if (isset($_FILES['crop_image']) && $_FILES['crop_image']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['crop_image'];
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if (!in_array($ext, $allowed)) {
                $error = 'Only JPG, JPEG, PNG, and WEBP formats are supported.';
            } elseif ($file['size'] > 5 * 1024 * 1024) {
                $error = 'Image file size must not exceed 5 MB.';
            } else {
                $upload_dir = __DIR__ . '/../uploads/crops/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }
                $filename = 'crop_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
                $target = $upload_dir . $filename;
                if (move_uploaded_file($file['tmp_name'], $target)) {
                    $image_path = 'uploads/crops/' . $filename;
                }
            }
        }

        if (empty($error)) {
            if (isset($pdo)) {
                $stmt = $pdo->prepare("
                    INSERT INTO crops (farmer_id, name, quantity, unit, grade, expected_price, image, location, description, rating, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, 'active')
                ");
                $done = $stmt->execute([$farmer_id, $name, $quantity, $unit, $grade, $expected_price, $image_path, $location, $description]);

                if ($done) {
                    $crop_id = $pdo->lastInsertId();
                    // Send notification to Admin
                    create_notification($pdo, 6, 'New Crop Listing', "{$farmer_name} listed {$name} ({$quantity} {$unit}) in {$location}.");
                    $success = 'Crop listing created successfully! It is now visible in the Marketplace.';
                } else {
                    $error = 'Failed to save crop listing.';
                }
            } else {
                $error = 'Database connection error.';
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
          <div>
            <h4 class="fw-bold mb-0">🌱 List New Crop</h4>
            <p class="small text-white-50 mb-0">Connect directly with wholesale buyers</p>
          </div>
          <a href="/farmer/my_crops.php" class="btn btn-outline-light btn-sm rounded-pill">View My Crops</a>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>
          <?php if ($success): ?>
            <div class="alert alert-success py-2 small"><?php echo htmlspecialchars($success); ?></div>
          <?php endif; ?>

          <form action="add_crop.php" method="POST" enctype="multipart/form-data">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small fw-bold">Crop Name *</label>
                <input type="text" name="name" class="form-control rounded-3" placeholder="e.g. Tomato (Desi Hybrid Red)" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Quality Grade *</label>
                <select name="grade" class="form-select rounded-3">
                  <option value="A+" selected>Grade A+ (Premium / Export Quality)</option>
                  <option value="A">Grade A (High Commercial Quality)</option>
                  <option value="B">Grade B (Standard Market Quality)</option>
                  <option value="C">Grade C (Processing / Bulk)</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Available Quantity *</label>
                <input type="number" step="0.1" name="quantity" class="form-control rounded-3" placeholder="e.g. 50" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Unit of Measurement *</label>
                <select name="unit" class="form-select rounded-3">
                  <option value="Quintal" selected>Quintal (100 Kg)</option>
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Ton">Metric Ton</option>
                  <option value="Bags (50kg)">Bags (50 Kg each)</option>
                  <option value="Crates">Standard Crates (25 Kg)</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Expected Price (₹ per unit) *</label>
                <input type="number" step="1" name="expected_price" class="form-control rounded-3" placeholder="e.g. 1550" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Farm / Storage Location *</label>
                <input type="text" name="location" class="form-control rounded-3" placeholder="e.g. Karnal, Haryana" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Upload Crop Photo (Max 5MB)</label>
                <input type="file" name="crop_image" class="form-control rounded-3" accept=".jpg,.jpeg,.png,.webp">
                <div class="form-text small">Accepted: JPG, JPEG, PNG, WEBP</div>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Harvest Details / Produce Description</label>
                <textarea name="description" class="form-control rounded-3" rows="3" placeholder="Provide information about harvesting date, moisture content, packing method, or transport readiness..."></textarea>
              </div>
            </div>

            <div class="mt-4">
              <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">Publish Crop Listing</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
