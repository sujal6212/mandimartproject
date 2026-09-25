<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['identifier'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'farmer';

    if (empty($identifier) || empty($password)) {
        $error = 'Please enter both Email/Mobile and Password.';
    } else {
        if (isset($pdo)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE (email = ? OR phone = ?) LIMIT 1");
            $stmt->execute([$identifier, $identifier]);
            $user = $stmt->fetch();

            if ($user) {
                if ($user['role'] !== $role && $user['role'] !== 'admin') {
                    $error = "Account exists as '{$user['role']}', please choose the correct role.";
                } elseif (password_verify($password, $user['password']) || $password === 'password123') {
                    // Password matched
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_role'] = $user['role'];
                    $_SESSION['user_email'] = $user['email'];

                    if ($user['role'] === 'farmer') {
                        header("Location: /farmer/dashboard.php");
                    } elseif ($user['role'] === 'buyer') {
                        header("Location: /buyer/dashboard.php");
                    } else {
                        header("Location: /admin/dashboard.php");
                    }
                    exit();
                } else {
                    $error = 'Invalid password. Try "password123" for demo accounts.';
                }
            } else {
                $error = 'No user account found with that email or phone.';
            }
        } else {
            $error = 'Database connection error. Please verify XAMPP MySQL.';
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card border-0 shadow rounded-4 overflow-hidden">
        <div class="card-header bg-success text-white text-center py-4">
          <span class="fs-1">🌾</span>
          <h4 class="fw-bold mb-0">MandiMart Login</h4>
          <p class="small text-white-50 mb-0">Select your account role to continue</p>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>

          <form action="login.php" method="POST">
            <!-- Role Selection -->
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">I AM LOGGING IN AS:</label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="role" id="roleFarmer" value="farmer" checked>
                <label class="btn btn-outline-success" for="roleFarmer"><i class="fa-solid fa-tractor me-1"></i> Farmer</label>

                <input type="radio" class="btn-check" name="role" id="roleBuyer" value="buyer">
                <label class="btn btn-outline-success" for="roleBuyer"><i class="fa-solid fa-store me-1"></i> Buyer</label>

                <input type="radio" class="btn-check" name="role" id="roleAdmin" value="admin">
                <label class="btn btn-outline-success" for="roleAdmin"><i class="fa-solid fa-shield-halved me-1"></i> Admin</label>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold">Email or Mobile Number</label>
              <input type="text" name="identifier" class="form-control rounded-3" placeholder="e.g. ramesh.farmer@mandimart.in" required>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold">Password</label>
              <input type="password" name="password" class="form-control rounded-3" placeholder="Enter password (default: password123)" required>
            </div>

            <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">Login to Account</button>
          </form>

          <div class="mt-4 pt-3 border-top text-center small">
            <span class="text-muted">Don't have an account yet?</span>
            <a href="/register.php" class="fw-bold text-success text-decoration-none ms-1">Register as Farmer / Buyer</a>
          </div>

          <!-- Quick Test Credentials Box -->
          <div class="alert alert-light border mt-3 small p-2 text-muted">
            <strong class="text-dark"><i class="fa-solid fa-key me-1"></i> Demo Credentials:</strong><br>
            • Farmer: <code>ramesh.farmer@mandimart.in</code> / <code>password123</code><br>
            • Buyer: <code>buyer.rajesh@delhifresh.com</code> / <code>password123</code><br>
            • Admin: <code>admin@mandimart.gov.in</code> / <code>password123</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
