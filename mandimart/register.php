<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role = $_POST['role'] ?? 'farmer';
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $address = trim($_POST['address'] ?? '');
    $state = trim($_POST['state'] ?? 'Haryana');
    $district = trim($_POST['district'] ?? 'Karnal');
    $pincode = trim($_POST['pincode'] ?? '');
    $village = trim($_POST['village'] ?? '');
    $business_type = trim($_POST['business_type'] ?? '');
    $contact_person = trim($_POST['contact_person'] ?? '');

    // Validation
    if (empty($name) || empty($email) || empty($phone) || empty($password)) {
        $error = 'Please fill all required registration fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (strlen($phone) < 10) {
        $error = 'Please enter a valid 10-digit mobile number.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } else {
        if (isset($pdo)) {
            // Check duplicates
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
            $stmt->execute([$email, $phone]);
            if ($stmt->fetch()) {
                $error = 'An account with this email or mobile number already exists.';
            } else {
                // Hash password securely
                $hashed_pw = password_hash($password, PASSWORD_BCRYPT);
                $insert = $pdo->prepare("
                    INSERT INTO users (name, email, phone, password, role, address, state, district, village, pincode, business_type, contact_person)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $done = $insert->execute([
                    $name, $email, $phone, $hashed_pw, $role, $address, $state, $district, $village, $pincode, $business_type, $contact_person
                ]);

                if ($done) {
                    header("Location: /login.php?registered=success");
                    exit();
                } else {
                    $error = 'Failed to register account. Please try again.';
                }
            }
        } else {
            $error = 'Database connection not available.';
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card border-0 shadow rounded-4 overflow-hidden">
        <div class="card-header bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 class="fw-bold mb-0">🌾 Register for MandiMart</h4>
            <p class="small text-white-50 mb-0">Join the digital agricultural revolution</p>
          </div>
          <span class="badge bg-warning text-dark px-3 py-2 rounded-pill">Free Registration</span>
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger py-2 small"><?php echo htmlspecialchars($error); ?></div>
          <?php endif; ?>

          <form action="register.php" method="POST" id="regForm">
            <!-- Role Toggle -->
            <div class="mb-4">
              <label class="form-label fw-bold small text-muted">SELECT ACCOUNT TYPE</label>
              <div class="row g-2">
                <div class="col-6">
                  <input type="radio" class="btn-check" name="role" id="regRoleFarmer" value="farmer" checked onchange="toggleRoleFields()">
                  <label class="btn btn-outline-success w-100 py-3 text-start d-flex align-items-center gap-2" for="regRoleFarmer">
                    <i class="fa-solid fa-tractor fs-4"></i>
                    <div>
                      <div class="fw-bold">Farmer / Producer</div>
                      <small class="text-muted">Sell crops, create auctions, track prices</small>
                    </div>
                  </label>
                </div>
                <div class="col-6">
                  <input type="radio" class="btn-check" name="role" id="regRoleBuyer" value="buyer" onchange="toggleRoleFields()">
                  <label class="btn btn-outline-success w-100 py-3 text-start d-flex align-items-center gap-2" for="regRoleBuyer">
                    <i class="fa-solid fa-store fs-4"></i>
                    <div>
                      <div class="fw-bold">Wholesale Buyer / Trader</div>
                      <small class="text-muted">Procure produce, place bids, send inquiries</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold" id="nameLabel">Full Name *</label>
                <input type="text" name="name" class="form-control rounded-3" placeholder="e.g. Ramesh Kumar" required>
              </div>

              <!-- Buyer Specific: Contact Person -->
              <div class="col-md-6 d-none" id="contactPersonField">
                <label class="form-label small fw-bold">Contact Person *</label>
                <input type="text" name="contact_person" class="form-control rounded-3" placeholder="e.g. Rajesh Gupta">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Mobile Number *</label>
                <input type="tel" name="phone" class="form-control rounded-3" placeholder="10-digit mobile number" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Email Address *</label>
                <input type="email" name="email" class="form-control rounded-3" placeholder="name@example.com" required>
              </div>

              <!-- Buyer Specific: Business Type -->
              <div class="col-md-6 d-none" id="businessTypeField">
                <label class="form-label small fw-bold">Business Type *</label>
                <select name="business_type" class="form-select rounded-3">
                  <option value="Wholesaler / Commission Agent">Wholesaler / Commission Agent</option>
                  <option value="B2B Retail Chain">B2B Retail Chain</option>
                  <option value="Food Processing Industry">Food Processing Industry</option>
                  <option value="Exporter">Agricultural Exporter</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Password *</label>
                <input type="password" name="password" class="form-control rounded-3" placeholder="Minimum 6 characters" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Confirm Password *</label>
                <input type="password" name="confirm_password" class="form-control rounded-3" placeholder="Re-type password" required>
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Farm / Business Address *</label>
                <input type="text" name="address" class="form-control rounded-3" placeholder="Street / Landmark / Highway" required>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">State *</label>
                <select name="state" class="form-select rounded-3" required>
                  <option value="Haryana" selected>Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">District *</label>
                <input type="text" name="district" class="form-control rounded-3" placeholder="e.g. Karnal" required>
              </div>

              <!-- Farmer Specific: Village -->
              <div class="col-md-4" id="villageField">
                <label class="form-label small fw-bold">Village / Gram</label>
                <input type="text" name="village" class="form-control rounded-3" placeholder="e.g. Taraori">
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Pincode *</label>
                <input type="text" name="pincode" class="form-control rounded-3" placeholder="6-digit pincode" required>
              </div>
            </div>

            <div class="mt-4">
              <button type="submit" class="btn btn-success w-100 py-2 rounded-pill fw-bold">Complete Registration</button>
            </div>
          </form>

          <div class="mt-3 text-center small">
            <span class="text-muted">Already registered?</span>
            <a href="/login.php" class="text-success fw-bold text-decoration-none ms-1">Login here</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
function toggleRoleFields() {
  const isFarmer = document.getElementById('regRoleFarmer').checked;
  const nameLabel = document.getElementById('nameLabel');
  const contactPersonField = document.getElementById('contactPersonField');
  const businessTypeField = document.getElementById('businessTypeField');
  const villageField = document.getElementById('villageField');

  if (isFarmer) {
    nameLabel.innerText = "Full Name *";
    contactPersonField.classList.add('d-none');
    businessTypeField.classList.add('d-none');
    villageField.classList.remove('d-none');
  } else {
    nameLabel.innerText = "Company / Entity Name *";
    contactPersonField.classList.remove('d-none');
    businessTypeField.classList.remove('d-none');
    villageField.classList.add('d-none');
  }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
