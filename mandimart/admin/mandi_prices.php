<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$msg = '';
$err = '';

// Add New Price
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_price') {
    $mandi_id = intval($_POST['mandi_id']);
    $crop_name = trim($_POST['crop_name']);
    $min_price = floatval($_POST['min_price']);
    $max_price = floatval($_POST['max_price']);
    $average_price = floatval($_POST['average_price']);
    $trend = $_POST['trend'] ?? 'stable';

    if ($min_price <= 0 || $max_price < $min_price || $average_price < $min_price || $average_price > $max_price) {
        $err = 'Invalid price range: Minimum must be <= Average <= Maximum.';
    } elseif (isset($pdo)) {
        $stmt = $pdo->prepare("
            INSERT INTO mandi_prices (mandi_id, crop_name, min_price, max_price, average_price, price_date, trend)
            VALUES (?, ?, ?, ?, ?, CURDATE(), ?)
        ");
        $stmt->execute([$mandi_id, $crop_name, $min_price, $max_price, $average_price, $trend]);
        $msg = 'Mandi price entry added successfully!';
    }
}

// Delete Price
if (isset($_GET['delete_id']) && isset($pdo)) {
    $del = $pdo->prepare("DELETE FROM mandi_prices WHERE id = ?");
    $del->execute([intval($_GET['delete_id'])]);
    $msg = 'Price record deleted successfully.';
}

$prices = [];
$mandis = [];
if (isset($pdo)) {
    $prices = $pdo->query("
        SELECT mp.*, m.name as mandi_name, m.location as mandi_location
        FROM mandi_prices mp
        JOIN mandis m ON mp.mandi_id = m.id
        ORDER BY mp.id DESC
    ")->fetchAll();

    $mandis = $pdo->query("SELECT id, name FROM mandis ORDER BY name ASC")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">📊 Manage Mandi Benchmark Prices</h3>
      <p class="text-muted small mb-0">Update modal wholesale prices across Azadpur, Ghazipur, and regional APMC yards.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <?php if ($msg): ?><div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>
  <?php if ($err): ?><div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($err); ?></div><?php endif; ?>

  <div class="row g-4">
    <!-- Add Price Form -->
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3">Add / Record Mandi Rate</h5>
        <form action="mandi_prices.php" method="POST">
          <input type="hidden" name="action" value="add_price">

          <div class="mb-3">
            <label class="form-label small fw-bold">Select Mandi *</label>
            <select name="mandi_id" class="form-select rounded-3" required>
              <?php foreach ($mandis as $m): ?>
                <option value="<?php echo $m['id']; ?>"><?php echo htmlspecialchars($m['name']); ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Crop / Commodity *</label>
            <input type="text" name="crop_name" class="form-control rounded-3" placeholder="e.g. Tomato" required>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-4">
              <label class="form-label small fw-bold">Min (₹)</label>
              <input type="number" step="10" name="min_price" class="form-control rounded-3" placeholder="1200" required>
            </div>
            <div class="col-4">
              <label class="form-label small fw-bold">Average (₹)</label>
              <input type="number" step="10" name="average_price" class="form-control rounded-3" placeholder="1500" required>
            </div>
            <div class="col-4">
              <label class="form-label small fw-bold">Max (₹)</label>
              <input type="number" step="10" name="max_price" class="form-control rounded-3" placeholder="1800" required>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold">Price Trend</label>
            <select name="trend" class="form-select rounded-3">
              <option value="up">UP ↗</option>
              <option value="down">DOWN ↘</option>
              <option value="stable" selected>STABLE →</option>
            </select>
          </div>

          <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">Save Price Entry</button>
        </form>
      </div>
    </div>

    <!-- Prices Table -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3">Current Benchmark Price Records</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle small mb-0">
            <thead class="table-light">
              <tr>
                <th>Mandi</th>
                <th>Crop</th>
                <th>Min (₹)</th>
                <th>Avg (₹)</th>
                <th>Max (₹)</th>
                <th>Trend</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($prices as $p): ?>
                <tr>
                  <td><strong><?php echo htmlspecialchars($p['mandi_name']); ?></strong></td>
                  <td><?php echo htmlspecialchars($p['crop_name']); ?></td>
                  <td>₹<?php echo number_format($p['min_price']); ?></td>
                  <td class="text-success fw-bold">₹<?php echo number_format($p['average_price']); ?></td>
                  <td>₹<?php echo number_format($p['max_price']); ?></td>
                  <td>
                    <?php if ($p['trend'] === 'up'): ?>
                      <span class="badge bg-success-subtle text-success">UP</span>
                    <?php elseif ($p['trend'] === 'down'): ?>
                      <span class="badge bg-danger-subtle text-danger">DOWN</span>
                    <?php else: ?>
                      <span class="badge bg-secondary-subtle text-secondary">STABLE</span>
                    <?php endif; ?>
                  </td>
                  <td>
                    <a href="mandi_prices.php?delete_id=<?php echo $p['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onclick="return confirm('Delete this price entry?');">
                      <i class="fa-solid fa-trash"></i>
                    </a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
