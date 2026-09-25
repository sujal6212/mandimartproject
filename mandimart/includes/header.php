<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$is_logged = isset($_SESSION['user_id']);
$user_role = $_SESSION['user_role'] ?? null;
$user_name = $_SESSION['user_name'] ?? 'User';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MandiMart – Agricultural Marketplace</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top" style="background-color: #1b5e20 !important;">
  <div class="container">
    <a class="navbar-brand fw-bold text-white fs-4 d-flex align-items-center gap-2" href="/index.php">
      <span class="fs-3">🌾</span> <span>MandiMart</span>
    </a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mandiNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mandiNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link text-white-50" href="/index.php"><i class="fa-solid fa-home me-1"></i> Home</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/farmer/find_mandi.php"><i class="fa-solid fa-location-dot me-1"></i> Find Mandi</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/buyer/marketplace.php"><i class="fa-solid fa-store me-1"></i> Marketplace</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/buyer/auctions.php"><i class="fa-solid fa-gavel me-1"></i> Auctions</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/farmer/mandi_prices.php"><i class="fa-solid fa-chart-line me-1"></i> Price Comparison</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/ai/comparison.php"><i class="fa-solid fa-leaf me-1"></i> AI Comparison</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/ai/chatbot.php"><i class="fa-solid fa-robot me-1"></i> AI Assistant</a></li>
        <li class="nav-item"><a class="nav-link text-white-50" href="/about.php">About</a></li>
      </ul>
      <div class="d-flex align-items-center gap-2">
        <?php if ($is_logged): ?>
          <?php if ($user_role === 'farmer'): ?>
            <a href="/farmer/dashboard.php" class="btn btn-outline-light btn-sm rounded-pill"><i class="fa-solid fa-tractor me-1"></i> Farmer Dashboard</a>
          <?php elseif ($user_role === 'buyer'): ?>
            <a href="/buyer/dashboard.php" class="btn btn-outline-light btn-sm rounded-pill"><i class="fa-solid fa-user me-1"></i> Buyer Dashboard</a>
          <?php elseif ($user_role === 'admin'): ?>
            <a href="/admin/dashboard.php" class="btn btn-outline-light btn-sm rounded-pill"><i class="fa-solid fa-shield-halved me-1"></i> Admin Panel</a>
          <?php endif; ?>
          <a href="/logout.php" class="btn btn-danger btn-sm rounded-pill"><i class="fa-solid fa-right-from-bracket"></i></a>
        <?php else: ?>
          <a href="/login.php" class="btn btn-outline-light btn-sm rounded-pill px-3">Login</a>
          <a href="/register.php" class="btn btn-warning btn-sm rounded-pill px-3 text-dark fw-bold">Register</a>
        <?php endif; ?>
      </div>
    </div>
  </div>
</nav>
