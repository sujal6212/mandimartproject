<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

// Fetch dynamic statistics from MySQL
$total_farmers = 3;
$total_buyers = 2;
$listed_crops = 7;
$active_auctions = 3;

if (isset($pdo)) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'farmer'");
        $total_farmers = $stmt->fetchColumn();

        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'buyer'");
        $total_buyers = $stmt->fetchColumn();

        $stmt = $pdo->query("SELECT COUNT(*) FROM crops WHERE status = 'active'");
        $listed_crops = $stmt->fetchColumn();

        $stmt = $pdo->query("SELECT COUNT(*) FROM auctions WHERE status = 'active'");
        $active_auctions = $stmt->fetchColumn();
    } catch (Exception $e) {}
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="hero-section text-white py-5 position-relative overflow-hidden" style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%);">
  <div class="container py-4">
    <div class="row align-items-center g-5">
      <div class="col-lg-7">
        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">🌾 Direct Digital Mandi & AI Marketplace</span>
        <h1 class="display-4 fw-bold mb-3">Sell Smarter. Earn Better.</h1>
        <p class="lead text-light mb-4">Connect directly with verified buyers and discover transparent, real-time mandi prices near you. Eliminate middlemen commissions and verify quality with computer vision.</p>
        <div class="d-flex flex-wrap gap-3">
          <a href="/farmer/find_mandi.php" class="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark"><i class="fa-solid fa-location-dot me-2"></i>Find Nearby Mandis</a>
          <a href="/farmer/add_crop.php" class="btn btn-outline-light btn-lg rounded-pill px-4"><i class="fa-solid fa-seedling me-2"></i>Sell Your Crop</a>
          <a href="/buyer/marketplace.php" class="btn btn-light btn-lg rounded-pill px-4 text-success fw-bold"><i class="fa-solid fa-store me-2"></i>Browse Marketplace</a>
        </div>
      </div>
      <div class="col-lg-5 text-center">
        <div class="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
          <h5 class="fw-bold text-success mb-3"><i class="fa-solid fa-chart-line me-2"></i>Live Mandi Price Snippet</h5>
          <div class="alert alert-warning py-1 small mb-3"><i class="fa-solid fa-info-circle me-1"></i> Demo Data – Not Live Market Prices</div>
          <ul class="list-group list-group-flush text-start small">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div><strong>Azadpur Mandi</strong><br><span class="text-muted">Tomato (Hybrid Red)</span></div>
              <span class="badge bg-success rounded-pill fs-6">₹1,500/Qtl</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div><strong>Ghazipur Mandi</strong><br><span class="text-muted">Nashik Red Onion</span></div>
              <span class="badge bg-success rounded-pill fs-6">₹2,480/Qtl</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div><strong>Karnal Grain Mandi</strong><br><span class="text-muted">Sharbati Wheat</span></div>
              <span class="badge bg-success rounded-pill fs-6">₹2,360/Qtl</span>
            </li>
          </ul>
          <a href="/farmer/mandi_prices.php" class="btn btn-outline-success btn-sm mt-3 rounded-pill">View All Mandi Rates & Trends</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Dynamic Statistics (From MySQL) -->
<section class="py-4 bg-light border-bottom">
  <div class="container">
    <div class="row text-center g-3">
      <div class="col-md-3 col-6">
        <div class="p-3 bg-white rounded-3 shadow-sm border">
          <i class="fa-solid fa-tractor fs-2 text-success mb-2"></i>
          <h3 class="fw-bold text-dark mb-0"><?php echo htmlspecialchars((string)$total_farmers); ?></h3>
          <span class="text-muted small">Registered Farmers</span>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-3 bg-white rounded-3 shadow-sm border">
          <i class="fa-solid fa-store fs-2 text-success mb-2"></i>
          <h3 class="fw-bold text-dark mb-0"><?php echo htmlspecialchars((string)$total_buyers); ?></h3>
          <span class="text-muted small">Wholesale Buyers</span>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-3 bg-white rounded-3 shadow-sm border">
          <i class="fa-solid fa-wheat-awn fs-2 text-success mb-2"></i>
          <h3 class="fw-bold text-dark mb-0"><?php echo htmlspecialchars((string)$listed_crops); ?></h3>
          <span class="text-muted small">Listed Crops</span>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-3 bg-white rounded-3 shadow-sm border">
          <i class="fa-solid fa-gavel fs-2 text-success mb-2"></i>
          <h3 class="fw-bold text-dark mb-0"><?php echo htmlspecialchars((string)$active_auctions); ?></h3>
          <span class="text-muted small">Active Auctions</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 6 Core Features Section -->
<section class="py-5">
  <div class="container">
    <div class="text-center mb-5">
      <span class="text-success fw-bold text-uppercase small">Platform Capabilities</span>
      <h2 class="fw-bold text-dark">Engineered for Agricultural Prosperity</h2>
      <p class="text-muted">A comprehensive ecosystem built to solve price asymmetry for Indian farmers.</p>
    </div>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-chart-line fs-3"></i>
          </div>
          <h5 class="fw-bold">1. Nearby Mandi Prices</h5>
          <p class="text-muted small">Real-time and benchmark mandi rates with daily trends, minimum, maximum, and average price comparisons.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-handshake fs-3"></i>
          </div>
          <h5 class="fw-bold">2. Direct Buyer Connection</h5>
          <p class="text-muted small">Inquiry messaging connecting farmers straight with food processors, retailers, and commission agents without middlemen cuts.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-store fs-3"></i>
          </div>
          <h5 class="fw-bold">3. Crop Marketplace</h5>
          <p class="text-muted small">Filter by crop type, quality grade (A+, A, B), expected price, and location with responsive live search.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-gavel fs-3"></i>
          </div>
          <h5 class="fw-bold">4. Live Auctions</h5>
          <p class="text-muted small">Farmers launch timed lots with minimum reserve prices; buyers place competitive bids with strict server-side validation.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-robot fs-3"></i>
          </div>
          <h5 class="fw-bold">5. AI Assistant</h5>
          <p class="text-muted small">Intelligent bilingual chatbot assisting in mandi rates, crop listing rules, auction guidance, and crop health advice.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm rounded-4 p-4 hover-lift">
          <div class="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
            <i class="fa-solid fa-camera fs-3"></i>
          </div>
          <h5 class="fw-bold">6. AI Vegetable Comparison</h5>
          <p class="text-muted small">Upload two produce images; our Python/Pillow computer vision calculates freshness, color, size, defect scores, and dynamic winner.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- How MandiMart Works (5 Steps) -->
<section class="py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <span class="text-success fw-bold text-uppercase small">Simple & Transparent</span>
      <h2 class="fw-bold text-dark">How MandiMart Works</h2>
    </div>
    <div class="row g-4 text-center">
      <div class="col-md">
        <div class="p-3">
          <div class="badge bg-success rounded-circle p-3 fs-5 mb-3">1</div>
          <h6 class="fw-bold">Create Account</h6>
          <p class="text-muted small">Register as a Farmer or Buyer with mobile verification.</p>
        </div>
      </div>
      <div class="col-md">
        <div class="p-3">
          <div class="badge bg-success rounded-circle p-3 fs-5 mb-3">2</div>
          <h6 class="fw-bold">List Your Crop</h6>
          <p class="text-muted small">Upload photos, quantity, unit, grade, and expected price.</p>
        </div>
      </div>
      <div class="col-md">
        <div class="p-3">
          <div class="badge bg-success rounded-circle p-3 fs-5 mb-3">3</div>
          <h6 class="fw-bold">Compare Prices</h6>
          <p class="text-muted small">Check benchmark prices across Azadpur, Ghazipur, and nearby mandis.</p>
        </div>
      </div>
      <div class="col-md">
        <div class="p-3">
          <div class="badge bg-success rounded-circle p-3 fs-5 mb-3">4</div>
          <h6 class="fw-bold">Connect With Buyers</h6>
          <p class="text-muted small">Receive direct inquiries or host a live auction with bids.</p>
        </div>
      </div>
      <div class="col-md">
        <div class="p-3">
          <div class="badge bg-success rounded-circle p-3 fs-5 mb-3">5</div>
          <h6 class="fw-bold">Sell Your Produce</h6>
          <p class="text-muted small">Finalize order at maximum fair value with transparent terms.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
