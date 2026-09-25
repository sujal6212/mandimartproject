<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$selected_crop = $_GET['crop'] ?? 'Tomato';
$prices = [];

if (isset($pdo)) {
    $stmt = $pdo->prepare("
        SELECT mp.*, m.name as mandi_name, m.location as mandi_location, m.state, m.district
        FROM mandi_prices mp
        JOIN mandis m ON mp.mandi_id = m.id
        WHERE mp.crop_name LIKE ?
        ORDER BY mp.average_price DESC
    ");
    $stmt->execute(["%$selected_crop%"]);
    $prices = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
    <div>
      <span class="text-success fw-bold small"><i class="fa-solid fa-chart-line me-1"></i> Market Intelligence</span>
      <h2 class="fw-bold mb-0">Mandi Price Comparison</h2>
      <p class="text-muted small mb-0">Compare live benchmark prices across Azadpur, Ghazipur, Keshopur, Okhla, and regional mandis.</p>
    </div>
    <div class="mt-3 mt-md-0">
      <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
        <i class="fa-solid fa-triangle-exclamation me-1"></i> Demo Data – Not Live Market Prices
      </span>
    </div>
  </div>

  <!-- Crop Selector Filter -->
  <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <span class="small fw-bold text-muted me-2">SELECT CROP:</span>
      <?php
      $crop_options = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Brinjal', 'Cauliflower', 'Carrot'];
      foreach ($crop_options as $c):
      ?>
        <a href="mandi_prices.php?crop=<?php echo urlencode($c); ?>" class="btn btn-sm rounded-pill <?php echo strcasecmp($selected_crop, $c) === 0 ? 'btn-success fw-bold' : 'btn-white bg-white border text-dark'; ?>">
          <?php echo htmlspecialchars($c); ?>
        </a>
      <?php endforeach; ?>
    </div>
  </div>

  <div class="row g-4 mb-4">
    <!-- Comparison Table -->
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <h5 class="fw-bold mb-3"><i class="fa-solid fa-table me-2 text-success"></i>Mandi Rates for <?php echo htmlspecialchars($selected_crop); ?></h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light small">
              <tr>
                <th>Mandi Name</th>
                <th>Min (₹/Qtl)</th>
                <th>Max (₹/Qtl)</th>
                <th>Average (₹/Qtl)</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody class="small">
              <?php if (empty($prices)): ?>
                <tr><td colspan="5" class="text-center py-4 text-muted">No price records found for this crop.</td></tr>
              <?php else: ?>
                <?php foreach ($prices as $p): ?>
                  <tr>
                    <td>
                      <div class="fw-bold"><?php echo htmlspecialchars($p['mandi_name']); ?></div>
                      <small class="text-muted"><?php echo htmlspecialchars($p['mandi_location']); ?></small>
                    </td>
                    <td class="text-muted">₹<?php echo number_format($p['min_price']); ?></td>
                    <td class="text-muted">₹<?php echo number_format($p['max_price']); ?></td>
                    <td><strong class="text-success fs-6">₹<?php echo number_format($p['average_price']); ?></strong></td>
                    <td>
                      <?php if ($p['trend'] === 'up'): ?>
                        <span class="badge bg-success-subtle text-success"><i class="fa-solid fa-arrow-up"></i> UP</span>
                      <?php elseif ($p['trend'] === 'down'): ?>
                        <span class="badge bg-danger-subtle text-danger"><i class="fa-solid fa-arrow-down"></i> DOWN</span>
                      <?php else: ?>
                        <span class="badge bg-secondary-subtle text-secondary"><i class="fa-solid fa-minus"></i> STABLE</span>
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

    <!-- Visual Chart -->
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
        <h5 class="fw-bold mb-3"><i class="fa-solid fa-chart-column me-2 text-success"></i>Price Visualizer</h5>
        <p class="small text-muted mb-4">Average modal price comparison across tracked wholesale markets (₹ per Quintal).</p>
        <div style="min-height: 250px;">
          <?php if (!empty($prices)): ?>
            <?php
            $max_chart_val = 1;
            foreach ($prices as $p) {
                if ($p['average_price'] > $max_chart_val) $max_chart_val = $p['average_price'];
            }
            ?>
            <div class="d-flex flex-column gap-3">
              <?php foreach ($prices as $p): ?>
                <?php $pct = round(($p['average_price'] / ($max_chart_val * 1.15)) * 100); ?>
                <div>
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span><?php echo htmlspecialchars($p['mandi_name']); ?></span>
                    <span class="text-success">₹<?php echo number_format($p['average_price']); ?></span>
                  </div>
                  <div class="progress" style="height: 12px;">
                    <div class="progress-bar bg-success rounded-pill" role="progressbar" style="width: <?php echo $pct; ?>%"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted" style="font-size: 11px;">
                    <span>Min: ₹<?php echo number_format($p['min_price']); ?></span>
                    <span>Max: ₹<?php echo number_format($p['max_price']); ?></span>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          <?php else: ?>
            <div class="text-center py-5 text-muted small">No comparison data available.</div>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>

  <div class="alert alert-light border rounded-4 p-3 small text-muted d-flex align-items-center gap-3">
    <i class="fa-solid fa-lightbulb text-warning fs-3"></i>
    <div>
      <strong>Farmer Selling Tip:</strong> Compare transport cost against price differentials. If Azadpur offers ₹100/Quintal higher average price than your local mandi, ensure freight charges are under ₹40/Quintal to maximize net profitability.
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
