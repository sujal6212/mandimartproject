<?php
require_once __DIR__ . '/../includes/admin_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_mandi') {
    $name = trim($_POST['name']);
    $location = trim($_POST['location']);
    $state = trim($_POST['state']);
    $district = trim($_POST['district']);
    $lat = floatval($_POST['latitude']);
    $lng = floatval($_POST['longitude']);

    if (isset($pdo)) {
        $stmt = $pdo->prepare("INSERT INTO mandis (name, location, state, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $location, $state, $district, $lat, $lng]);
        $msg = 'Mandi added successfully.';
    }
}

if (isset($_GET['del_id']) && isset($pdo)) {
    $del = $pdo->prepare("DELETE FROM mandis WHERE id = ?");
    $del->execute([intval($_GET['del_id'])]);
    $msg = 'Mandi removed.';
}

$mandis = [];
if (isset($pdo)) {
    $mandis = $pdo->query("SELECT * FROM mandis ORDER BY id DESC")->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="fw-bold mb-0">📍 Manage Mandi Geolocation Registry</h3>
      <p class="text-muted small mb-0">Registered wholesale APMC markets with coordinates for Haversine distance calculations.</p>
    </div>
    <a href="/admin/dashboard.php" class="btn btn-outline-secondary btn-sm rounded-pill">&larr; Back to Admin</a>
  </div>

  <?php if ($msg): ?><div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

  <div class="row g-4">
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3">Add New Mandi</h5>
        <form action="mandis.php" method="POST">
          <input type="hidden" name="action" value="add_mandi">
          <div class="mb-3">
            <label class="form-label small fw-bold">Mandi Name *</label>
            <input type="text" name="name" class="form-control rounded-3" placeholder="e.g. Sahibabad Sabzi Mandi" required>
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Location Address *</label>
            <input type="text" name="location" class="form-control rounded-3" placeholder="e.g. GT Road, Ghaziabad" required>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold">State</label>
              <input type="text" name="state" class="form-control rounded-3" value="Uttar Pradesh" required>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold">District</label>
              <input type="text" name="district" class="form-control rounded-3" value="Ghaziabad" required>
            </div>
          </div>
          <div class="row g-2 mb-4">
            <div class="col-6">
              <label class="form-label small fw-bold">Latitude</label>
              <input type="number" step="0.0001" name="latitude" class="form-control rounded-3" value="28.6700" required>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold">Longitude</label>
              <input type="number" step="0.0001" name="longitude" class="form-control rounded-3" value="77.3500" required>
            </div>
          </div>
          <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">Register Mandi</button>
        </form>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3">Active Mandi Records (<?php echo count($mandis); ?>)</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle small mb-0">
            <thead class="table-light">
              <tr>
                <th>Mandi</th>
                <th>State / District</th>
                <th>Coordinates</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($mandis as $m): ?>
                <tr>
                  <td>
                    <strong><?php echo htmlspecialchars($m['name']); ?></strong><br>
                    <small class="text-muted"><?php echo htmlspecialchars($m['location']); ?></small>
                  </td>
                  <td><?php echo htmlspecialchars($m['district'] . ', ' . $m['state']); ?></td>
                  <td class="font-monospace"><?php echo round($m['latitude'], 4); ?>, <?php echo round($m['longitude'], 4); ?></td>
                  <td>
                    <a href="mandis.php?del_id=<?php echo $m['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill" onclick="return confirm('Delete mandi?');">
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
