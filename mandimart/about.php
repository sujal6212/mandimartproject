<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <!-- Header -->
  <div class="text-center mb-5">
    <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">Academic Project & Architecture</span>
    <h1 class="fw-bold mt-2">🌾 About MandiMart</h1>
    <p class="lead text-muted">"Sell Smarter. Earn Better." A Next-Generation Agricultural Supply Chain & AI Quality Ecosystem</p>
  </div>

  <div class="row g-5">
    <!-- Problem & Objectives -->
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h4 class="fw-bold text-success mb-3"><i class="fa-solid fa-triangle-exclamation me-2"></i>The Core Problem in Indian Agriculture</h4>
        <p class="text-secondary">Farmers frequently face multi-layered intermediary exploitation. Because mandi prices fluctuate daily across markets and farmers lack direct digital connectivity to institutional buyers, they often liquidate harvest at sub-optimal prices.</p>
        <p class="text-secondary">MandiMart eliminates price asymmetry through transparent mandi price dissemination, geolocated distance matching, direct buyer-to-farmer inquiries, and competitive live auctions.</p>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h4 class="fw-bold text-success mb-3"><i class="fa-solid fa-bullseye me-2"></i>Key Project Objectives</h4>
        <ul class="list-unstyled mb-0">
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Direct Farmer-Buyer B2B Marketplace with zero commission leakage.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Multi-Mandi price tracking with daily high, low, and average price trends.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Browser Geolocation API to find nearest mandis and compute transport distance.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Real-time crop auction system with server-enforced bid increments.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Side-by-side product comparison tool for institutional buyers.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>AI Computer Vision vegetable quality comparison powered by Python Flask.</span></li>
          <li class="d-flex align-items-start gap-2 mb-2"><i class="fa-solid fa-check text-success mt-1"></i><span>Bilingual AI Chatbot Assistant for market and platform guidance.</span></li>
        </ul>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h4 class="fw-bold text-success mb-3"><i class="fa-solid fa-brain me-2"></i>AI Vegetable Quality Comparison Formula</h4>
        <p class="text-muted small mb-2">Our computer vision pipeline extracts RGB/HSL matrices, evaluates hydration vibrancy, edge curvature, and localized necrotic patches:</p>
        <div class="bg-light p-3 rounded-3 font-monospace small mb-3">
          Overall Score = (Freshness × 0.40) + (Color Consistency × 0.20) + (Size & Shape × 0.20) + (Defect-Free × 0.20)
        </div>
        <ul class="small text-muted mb-0">
          <li><strong>90–100</strong>: Grade A+ (Export / Luxury Retail)</li>
          <li><strong>80–89</strong>: Grade A (Premium Wholesale)</li>
          <li><strong>70–79</strong>: Grade B (Standard Table Produce)</li>
          <li><strong>60–69</strong>: Grade C (Processing / Sauces / Purees)</li>
          <li><strong>Below 60</strong>: Poor Quality</li>
        </ul>
      </div>
    </div>

    <!-- Tech Stack & Viva Notes -->
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-light">
        <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-layer-group me-2"></i>Technology Architecture</h5>
        <div class="mb-3">
          <h6 class="fw-bold text-success mb-1">Frontend Layer</h6>
          <p class="small text-muted mb-0">HTML5, CSS3, Bootstrap 5.3, Font Awesome 6, JavaScript (ES6+ Fetch / Geolocation API / Chart.js)</p>
        </div>
        <div class="mb-3">
          <h6 class="fw-bold text-success mb-1">Main Application Backend</h6>
          <p class="small text-muted mb-0">PHP 8.2+ with PDO (Prepared Statements, BCrypt password hashing, session RBAC)</p>
        </div>
        <div class="mb-3">
          <h6 class="fw-bold text-success mb-1">Relational Database</h6>
          <p class="small text-muted mb-0">MySQL 8.0 / MariaDB with foreign keys and composite indexes</p>
        </div>
        <div>
          <h6 class="fw-bold text-success mb-1">AI & Computer Vision Microservice</h6>
          <p class="small text-muted mb-0">Python 3.10+, Flask, Pillow, NumPy, CORS middleware</p>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4 text-white" style="background: #1b5e20;">
        <h5 class="fw-bold mb-3"><i class="fa-solid fa-graduation-cap me-2"></i>Viva Quick Facts</h5>
        <div class="small mb-3">
          <strong>Q: How does MandiMart ensure auction integrity?</strong><br>
          <span class="text-white-50">Bid validation is enforced strictly on the PHP/Express server. New bids must exceed current bid, farmers cannot bid on own lots, and expired auctions reject incoming bids.</span>
        </div>
        <div class="small mb-3">
          <strong>Q: How does distance calculation work?</strong><br>
          <span class="text-white-50">Uses browser Geolocation latitude and longitude and applies the Great-Circle Haversine Formula against stored Mandi GPS coordinates.</span>
        </div>
        <div class="small">
          <strong>Q: Why use Python Flask for AI comparison?</strong><br>
          <span class="text-white-50">Pillow and NumPy provide high-performance numerical matrix operations for color channels, edge variance, and defect detection.</span>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
