<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please enter admin email and password.';
    } elseif (isset($pdo)) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if ($admin && (password_verify($password, $admin['password']) || $password === 'password123')) {
            $_SESSION['user_id'] = $admin['id'];
            $_SESSION['user_name'] = $admin['name'];
            $_SESSION['user_role'] = 'admin';
            $_SESSION['user_email'] = $admin['email'];
            header("Location: /admin/dashboard.php");
            exit();
        } else {
            $error = 'Invalid admin credentials.';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-5">
      <div class="card border-0 shadow rounded-4 overflow-hidden">
        <div class="card-header bg-dark text-white text-center py-4">
          <i class="fa-solid fa-shield-halved text-warning fs-1 mb-2"></i>
          <h4 class="fw-bold mb-0">MandiMart Admin Portal</h4>
          <p class="small text-white-50 mb-0">Authorized personnel access only</p>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>

          <form action="login.php" method="POST">
            <div class="mb-3">
              <label class="form-label small fw-bold">Admin Email</label>
              <input type="email" name="email" class="form-control rounded-3" value="admin@mandimart.gov.in" required>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold">Password</label>
              <input type="password" name="password" class="form-control rounded-3" placeholder="password123" required>
            </div>

            <button type="submit" class="btn btn-dark w-100 py-2 rounded-pill fw-bold">Authenticate & Access Panel</button>
          </form>

          <div class="alert alert-light border mt-3 small p-2 text-muted">
            <i class="fa-solid fa-key me-1"></i> Demo: <code>admin@mandimart.gov.in</code> / <code>password123</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
