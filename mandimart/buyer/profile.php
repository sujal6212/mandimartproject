<?php
require_once __DIR__ . '/../includes/buyer_auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$buyer_id = $_SESSION['user_id'];
$user = null;
$msg = '';

if (isset($pdo)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = trim($_POST['name'] ?? '');
        $contact_person = trim($_POST['contact_person'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $business_type = trim($_POST['business_type'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $state = trim($_POST['state'] ?? '');
        $district = trim($_POST['district'] ?? '');
        $pincode = trim($_POST['pincode'] ?? '');

        $upd = $pdo->prepare("
            UPDATE users
            SET name = ?, contact_person = ?, phone = ?, business_type = ?, address = ?, state = ?, district = ?, pincode = ?
            WHERE id = ?
        ");
        $upd->execute([$name, $contact_person, $phone, $business_type, $address, $state, $district, $pincode, $buyer_id]);
        $_SESSION['user_name'] = $name;
        $msg = 'Company profile updated successfully!';
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$buyer_id]);
    $user = $stmt->fetch();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-success text-white py-3 px-4">
          <h4 class="fw-bold mb-0">🏢 Wholesale Buyer Profile</h4>
        </div>
        <div class="card-body p-4">
          <?php if ($msg): ?>
            <div class="alert alert-success py-2 small"><?php echo htmlspecialchars($msg); ?></div>
          <?php endif; ?>

          <form action="profile.php" method="POST">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Company / Buyer Trade Name</label>
                <input type="text" name="name" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['name'] ?? ''); ?>" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Contact Person</label>
                <input type="text" name="contact_person" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['contact_person'] ?? ''); ?>" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Email (Read-only)</label>
                <input type="email" class="form-control rounded-3 bg-light" value="<?php echo htmlspecialchars($user['email'] ?? ''); ?>" readonly>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Official Mobile</label>
                <input type="tel" name="phone" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>" required>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Business Type</label>
                <input type="text" name="business_type" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['business_type'] ?? 'Wholesaler'); ?>">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Pincode</label>
                <input type="text" name="pincode" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['pincode'] ?? ''); ?>">
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold">Office / Mandi Shed Address</label>
                <input type="text" name="address" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['address'] ?? ''); ?>">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">State</label>
                <input type="text" name="state" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['state'] ?? ''); ?>">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">District</label>
                <input type="text" name="district" class="form-control rounded-3" value="<?php echo htmlspecialchars($user['district'] ?? ''); ?>">
              </div>
            </div>

            <div class="mt-4">
              <button type="submit" class="btn btn-success py-2 px-4 rounded-pill fw-bold">Save Buyer Details</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
