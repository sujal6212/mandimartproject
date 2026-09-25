<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$mandis = [];
if (isset($pdo)) {
    $stmt = $pdo->query("SELECT * FROM mandis ORDER BY name ASC");
    $mandis = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Title -->
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
    <div>
      <span class="text-success fw-bold small"><i class="fa-solid fa-location-crosshairs me-1"></i> Smart Geolocation</span>
      <h2 class="fw-bold mb-0">Find Nearby Mandis</h2>
      <p class="text-muted small mb-0">Find the closest agricultural markets, calculate travel distances, and minimize logistics overhead.</p>
    </div>
    <div class="mt-3 mt-md-0">
      <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
        <i class="fa-solid fa-triangle-exclamation me-1"></i> Demo Data – Not Live Market Prices
      </span>
    </div>
  </div>

  <!-- Location Finder Action Card -->
  <div class="card border-0 shadow-sm rounded-4 p-4 mb-4" style="background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);">
    <div class="row align-items-center g-3">
      <div class="col-md-7">
        <h5 class="fw-bold text-success mb-1"><i class="fa-solid fa-satellite-dish me-2"></i>Automated Distance Calculator</h5>
        <p class="small text-muted mb-0">Allow location access to instantly compute precise road kilometer distances from your farm coordinates to major grain and vegetable mandis.</p>
      </div>
      <div class="col-md-5 text-md-end">
        <button type="button" class="btn btn-success rounded-pill px-4 py-2 fw-bold" id="geoBtn" onclick="detectLocation()">
          <i class="fa-solid fa-crosshairs me-2"></i> Detect My Farm Location
        </button>
      </div>
    </div>

    <div id="locationStatus" class="small mt-3 d-none"></div>

    <!-- Manual Filter Fallback -->
    <div class="border-top pt-3 mt-3">
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <span class="small text-muted fw-bold">OR FILTER BY REGION:</span>
        </div>
        <div class="col-md-3">
          <select id="stateFilter" class="form-select form-select-sm rounded-pill" onchange="filterMandis()">
            <option value="all">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Haryana">Haryana</option>
          </select>
        </div>
        <div class="col-md-4">
          <input type="text" id="mandiSearch" class="form-control form-control-sm rounded-pill" placeholder="Search mandi by name or area..." onkeyup="filterMandis()">
        </div>
      </div>
    </div>
  </div>

  <!-- Mandi Cards Grid -->
  <div class="row g-4" id="mandiContainer">
    <?php foreach ($mandis as $m): ?>
      <div class="col-md-6 col-lg-4 mandi-card"
           data-name="<?php echo htmlspecialchars(strtolower($m['name'])); ?>"
           data-state="<?php echo htmlspecialchars($m['state']); ?>"
           data-lat="<?php echo $m['latitude']; ?>"
           data-lng="<?php echo $m['longitude']; ?>">
        <div class="card h-100 border shadow-sm rounded-4 p-4 position-relative">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-success-subtle text-success"><?php echo htmlspecialchars($m['state']); ?></span>
            <span class="badge bg-light text-dark border rounded-pill distance-badge">
              <i class="fa-solid fa-route me-1"></i> <span class="dist-val">-- km</span>
            </span>
          </div>

          <h5 class="fw-bold mb-1"><?php echo htmlspecialchars($m['name']); ?></h5>
          <p class="small text-muted mb-3"><i class="fa-solid fa-map-pin text-danger me-1"></i> <?php echo htmlspecialchars($m['location']); ?></p>

          <div class="bg-light p-3 rounded-3 small text-muted mb-3 flex-grow-1">
            <div class="d-flex justify-content-between mb-1">
              <span>District:</span>
              <strong class="text-dark"><?php echo htmlspecialchars($m['district']); ?></strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>GPS Coordinates:</span>
              <span class="font-monospace"><?php echo round($m['latitude'], 4); ?>, <?php echo round($m['longitude'], 4); ?></span>
            </div>
          </div>

          <div class="d-flex gap-2">
            <a href="/farmer/mandi_prices.php" class="btn btn-sm btn-outline-success flex-fill rounded-pill">View Rates</a>
            <a href="https://www.google.com/maps/search/?api=1&query=<?php echo $m['latitude']; ?>,<?php echo $m['longitude']; ?>" target="_blank" class="btn btn-sm btn-light border rounded-pill px-3" title="Open in Maps">
              <i class="fa-solid fa-diamond-turn-right text-primary"></i>
            </a>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<script>
// Haversine Formula for accurate earth distances in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

function detectLocation() {
  const status = document.getElementById('locationStatus');
  const btn = document.getElementById('geoBtn');
  status.classList.remove('d-none');
  status.innerHTML = '<span class="text-primary"><i class="fa-solid fa-spinner fa-spin me-1"></i> Requesting GPS coordinates from browser...</span>';

  if (!navigator.geolocation) {
    status.innerHTML = '<span class="text-danger">Geolocation is not supported by your browser. Please use manual state filter below.</span>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const uLat = position.coords.latitude;
      const uLng = position.coords.longitude;
      status.innerHTML = `<span class="text-success"><i class="fa-solid fa-circle-check me-1"></i> Farm Location Detected: ${uLat.toFixed(4)}° N, ${uLng.toFixed(4)}° E. Mandis sorted by nearest distance!</span>`;

      // Update distance on all cards
      const cards = Array.from(document.querySelectorAll('.mandi-card'));
      cards.forEach(card => {
        const mLat = parseFloat(card.getAttribute('data-lat'));
        const mLng = parseFloat(card.getAttribute('data-lng'));
        const dist = calculateDistance(uLat, uLng, mLat, mLng);
        card.setAttribute('data-distance', dist);
        card.querySelector('.dist-val').innerText = `${dist} km`;
      });

      // Sort cards nearest to furthest
      const container = document.getElementById('mandiContainer');
      cards.sort((a, b) => parseFloat(a.getAttribute('data-distance')) - parseFloat(b.getAttribute('data-distance')));
      cards.forEach(card => container.appendChild(card));
    },
    (error) => {
      let msg = 'Unable to retrieve your location.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Location permission was denied. You can select your state or search below.';
      }
      status.innerHTML = `<span class="text-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i> ${msg}</span>`;
    }
  );
}

function filterMandis() {
  const state = document.getElementById('stateFilter').value;
  const q = document.getElementById('mandiSearch').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.mandi-card');

  cards.forEach(c => {
    const cardState = c.getAttribute('data-state');
    const cardName = c.getAttribute('data-name');
    const matchesState = state === 'all' || cardState === state;
    const matchesSearch = cardName.includes(q);

    if (matchesState && matchesSearch) {
      c.classList.remove('d-none');
    } else {
      c.classList.add('d-none');
    }
  });
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
