<?php
require_once __DIR__ . '/../includes/farmer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$farmer_id = $_SESSION['user_id'];
$farmer_name = $_SESSION['user_name'];
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $crop_name = trim($_POST['crop_name'] ?? '');
    $quantity = floatval($_POST['quantity'] ?? 0);
    $unit = trim($_POST['unit'] ?? 'Quintal');
    $grade = trim($_POST['grade'] ?? 'A');
    $base_price = floatval($_POST['base_price'] ?? 0);
    $start_time = $_POST['start_time'] ?? date('Y-m-d H:i:s');
    $end_time = $_POST['end_time'] ?? '';
    $location = trim($_POST['location'] ?? 'Haryana');
    $description = trim($_POST['description'] ?? '');

    if (empty($crop_name) || $quantity <= 0 || $base_price <= 0 || empty($end_time)) {
        $error = 'Please fill all required auction fields properly.';
    } elseif (strtotime($end_time) <= strtotime($start_time)) {
        $error = 'Auction end time must be after the start time.';
    } else {
        if (isset($pdo)) {
            $stmt = $pdo->prepare("
                INSERT INTO auctions (farmer_id, crop_name, quantity, unit, grade, base_price, current_bid, start_time, end_time, status, description, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
            ");
            $done = $stmt->execute([
                $farmer_id, $crop_name, $quantity, $unit, $grade, $base_price, $base_price, $start_time, $end_time, $description, $location
            ]);

            if ($done) {
                create_notification($pdo, 6, 'New Auction Created', "{$farmer_name} started an auction for {$quantity} {$unit} {$crop_name} (Base ₹{$base_price}).");
                header("Location: /farmer/auctions.php?created=1");
                exit();
            } else {
                $error = 'Failed to create auction.';
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
        <div class="card-header bg-warning text-dark py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 class="fw-bold mb-0">🔨 Launch Competitive Crop Auction</h4>
            <p class="small text-muted mb-0">Set your reserve price and let verified buyers bid</p>
          </div>
          <a href="/farmer/auctions.php" class="btn btn-outline-dark btn-sm rounded-pill">&larr; Back to Auctions</a>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>

          <form action="create_auction.php" method="POST">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small fw-bold">Crop / Produce Name *</label>
                <input type="text" name="crop_name" class="form-control rounded-3" placeholder="e.g. Sharbati Golden Wheat" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Quality Grade *</label>
                <select name="grade" class="form-select rounded-3">
                  <option value="A+" selected>Grade A+</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Lot Quantity *</label>
                <input type="number" step="0.1" name="quantity" class="form-control rounded-3" placeholder="e.g. 100" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Unit *</label>
                <select name="unit" class="form-select rounded-3">
                  <option value="Quintal" selected>Quintal</option>
                  <option value="Kg">Kg</option>
                  <option value="Ton">Ton</option>
                  <option value="Bags (50kg)">Bags (50kg)</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Reserve Base Price (₹) *</label>
                <input type="number" step="1" name="base_price" class="form-control rounded-3" placeholder="e.g. 2200" required>
                <div class="form-text small">Minimum allowed opening bid.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Auction Start Time *</label>
                <input type="datetime-local" name="start_time" class="form-control rounded-3" value="<?php echo date('Y-m-d\TH:i'); ?>" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Auction End Time *</label>
                <input type="datetime-local" name="end_time" class="form-control rounded-3" value="<?php echo date('Y-m-d\TH:i', strtotime('+2 days')); ?>" required>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Lot Location *</label>
                <input type="text" name="location" class="form-control rounded-3" placeholder="e.g. Karnal, Haryana" required>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Auction Lot Terms & Description</label>
                <textarea name="description" class="form-control rounded-3" rows="3" placeholder="Specify dispatch terms, minimum bid increment (e.g. ₹20), loading arrangements..."></textarea>
              </div>
            </div>

            <div class="mt-4">
              <button type="submit" class="btn btn-warning text-dark fw-bold w-100 py-2 rounded-pill">Start Live Auction</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
