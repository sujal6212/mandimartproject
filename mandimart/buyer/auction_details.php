<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$auction_id = intval($_GET['id'] ?? 0);
$auction = null;
$bids = [];
$error = '';
$success = '';

if (isset($pdo)) {
    // Fetch auction details
    $stmt = $pdo->prepare("
        SELECT a.*, u.name as farmer_name, u.phone as farmer_phone, u.location as farmer_location
        FROM auctions a
        JOIN users u ON a.farmer_id = u.id
        WHERE a.id = ?
    ");
    $stmt->execute([$auction_id]);
    $auction = $stmt->fetch();

    if (!$auction) {
        header("Location: /buyer/auctions.php");
        exit();
    }

    // Handle New Bid Submission
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['bid_amount'])) {
        if (!isset($_SESSION['user_id'])) {
            $error = 'Please log in to place bids on auctions.';
        } elseif ($_SESSION['user_role'] !== 'buyer') {
            $error = 'Only registered wholesale buyers can participate in auctions.';
        } elseif ($_SESSION['user_id'] == $auction['farmer_id']) {
            $error = 'Farmers cannot place bids on their own auction lots.';
        } elseif ($auction['status'] !== 'active') {
            $error = 'This auction has ended and is no longer accepting bids.';
        } elseif (strtotime($auction['end_time']) <= time()) {
            $error = 'Auction time has expired.';
            $pdo->prepare("UPDATE auctions SET status = 'ended' WHERE id = ?")->execute([$auction_id]);
        } else {
            $bid_amount = floatval($_POST['bid_amount']);
            if ($bid_amount <= $auction['current_bid']) {
                $error = "Your bid must be strictly higher than the current top bid of ₹" . number_format($auction['current_bid']) . ".";
            } else {
                $buyer_id = $_SESSION['user_id'];
                $buyer_name = $_SESSION['user_name'];

                // Insert into bids table
                $ins_bid = $pdo->prepare("INSERT INTO bids (auction_id, buyer_id, bid_amount) VALUES (?, ?, ?)");
                $ins_bid->execute([$auction_id, $buyer_id, $bid_amount]);

                // Update current bid in auctions table
                $upd_auc = $pdo->prepare("UPDATE auctions SET current_bid = ?, winner_id = ? WHERE id = ?");
                $upd_auc->execute([$bid_amount, $buyer_id, $auction_id]);

                // Notify farmer
                create_notification(
                    $pdo,
                    $auction['farmer_id'],
                    'New Top Bid on Auction! 🏷️',
                    "{$buyer_name} placed a new leading bid of ₹" . number_format($bid_amount) . " on your {$auction['crop_name']} lot."
                );

                $success = "Congratulations! Your bid of ₹" . number_format($bid_amount) . "/Quintal is now the leading bid!";
                // Refresh auction data
                $stmt->execute([$auction_id]);
                $auction = $stmt->fetch();
            }
        }
    }

    // Fetch Bid History
    $b_stmt = $pdo->prepare("
        SELECT b.*, u.name as buyer_name, u.business_type
        FROM bids b
        JOIN users u ON b.buyer_id = u.id
        WHERE b.auction_id = ?
        ORDER BY b.bid_amount DESC
    ");
    $b_stmt->execute([$auction_id]);
    $bids = $b_stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb small">
      <li class="breadcrumb-item"><a href="/index.php" class="text-success text-decoration-none">Home</a></li>
      <li class="breadcrumb-item"><a href="/buyer/auctions.php" class="text-success text-decoration-none">Auctions</a></li>
      <li class="breadcrumb-item active">Lot #<?php echo $auction['id']; ?></li>
    </ol>
  </nav>

  <?php if ($error): ?>
    <div class="alert alert-danger alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($error); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>
  <?php if ($success): ?>
    <div class="alert alert-success alert-dismissible fade show py-2 small" role="alert">
      <?php echo htmlspecialchars($success); ?>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>

  <div class="row g-4">
    <!-- Auction Lot Details -->
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge bg-warning text-dark fs-6 px-3 py-1">Grade <?php echo htmlspecialchars($auction['grade']); ?></span>
          <span class="badge <?php echo $auction['status'] === 'active' ? 'bg-success' : 'bg-secondary'; ?> rounded-pill px-3 py-1">
            <?php echo strtoupper($auction['status']); ?>
          </span>
        </div>

        <h2 class="fw-bold mb-1"><?php echo htmlspecialchars($auction['crop_name']); ?></h2>
        <p class="text-muted small mb-4">Offered by verified farmer <strong><?php echo htmlspecialchars($auction['farmer_name']); ?></strong> · <?php echo htmlspecialchars($auction['location']); ?></p>

        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="p-3 bg-light rounded-3 text-center">
              <span class="text-muted small">Lot Quantity</span>
              <div class="fw-bold fs-6 text-dark mt-1"><?php echo htmlspecialchars($auction['quantity'] . ' ' . $auction['unit']); ?></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-light rounded-3 text-center">
              <span class="text-muted small">Base Price</span>
              <div class="fw-bold fs-6 text-dark mt-1">₹<?php echo number_format($auction['base_price']); ?></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-success-subtle rounded-3 text-center">
              <span class="text-success small fw-bold">Current Top Bid</span>
              <div class="fw-bold fs-5 text-success mt-1">₹<?php echo number_format($auction['current_bid']); ?></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 bg-light rounded-3 text-center">
              <span class="text-muted small">Total Bids</span>
              <div class="fw-bold fs-6 text-dark mt-1"><?php echo count($bids); ?> Bids</div>
            </div>
          </div>
        </div>

        <h6 class="fw-bold mb-2">Lot Description & Dispatch Conditions:</h6>
        <p class="text-secondary small mb-0"><?php echo nl2br(htmlspecialchars($auction['description'] ?? 'Wholesale bulk farm produce available for verified pickup.')); ?></p>
      </div>

      <!-- Real-Time Bid History Table -->
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <h5 class="fw-bold mb-3"><i class="fa-solid fa-list-ol me-2 text-warning"></i>Live Bid History Log</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small">
              <tr>
                <th>Rank</th>
                <th>Bidder</th>
                <th>Bid Amount</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody class="small">
              <?php if (empty($bids)): ?>
                <tr><td colspan="4" class="text-center py-4 text-muted">No bids placed yet. Be the first to bid!</td></tr>
              <?php else: ?>
                <?php foreach ($bids as $idx => $b): ?>
                  <tr class="<?php echo $idx === 0 ? 'table-success fw-bold' : ''; ?>">
                    <td>
                      <?php if ($idx === 0): ?>
                        <span class="badge bg-success rounded-pill"><i class="fa-solid fa-crown me-1"></i> #1 Leader</span>
                      <?php else: ?>
                        <span class="text-muted">#<?php echo $idx + 1; ?></span>
                      <?php endif; ?>
                    </td>
                    <td>
                      <div><?php echo htmlspecialchars($b['buyer_name']); ?></div>
                      <small class="text-muted font-normal"><?php echo htmlspecialchars($b['business_type'] ?? 'Buyer'); ?></small>
                    </td>
                    <td class="fs-6 <?php echo $idx === 0 ? 'text-success' : 'text-dark'; ?>">
                      ₹<?php echo number_format($b['bid_amount']); ?> / <?php echo htmlspecialchars($auction['unit']); ?>
                    </td>
                    <td class="text-muted"><?php echo date('d M, h:i:s A', strtotime($b['created_at'])); ?></td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bid Input Panel & Countdown -->
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 80px;">
        <div class="text-center pb-3 border-bottom mb-4">
          <span class="text-muted small">AUCTION TIMER REMAINING</span>
          <div class="display-6 fw-bold text-danger my-1" id="countdownTimer">Loading...</div>
          <small class="text-muted">Closes on <?php echo date('d M Y \a\t h:i A', strtotime($auction['end_time'])); ?></small>
        </div>

        <div class="mb-4">
          <div class="d-flex justify-content-between text-muted small mb-1">
            <span>Current High Bid:</span>
            <strong class="text-dark">₹<?php echo number_format($auction['current_bid']); ?></strong>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-1">
            <span>Minimum Next Bid:</span>
            <strong class="text-success">₹<?php echo number_format($auction['current_bid'] + 10); ?></strong>
          </div>
        </div>

        <form action="auction_details.php?id=<?php echo $auction['id']; ?>" method="POST">
          <div class="mb-3">
            <label class="form-label fw-bold small">Enter Your Bid (₹ per <?php echo htmlspecialchars($auction['unit']); ?>) *</label>
            <div class="input-group">
              <span class="input-group-text bg-light fw-bold">₹</span>
              <input type="number" step="1" min="<?php echo $auction['current_bid'] + 1; ?>" name="bid_amount" class="form-control form-control-lg rounded-end-3" placeholder="<?php echo $auction['current_bid'] + 20; ?>" required>
            </div>
            <div class="form-text small">Bid amount must exceed ₹<?php echo number_format($auction['current_bid']); ?>.</div>
          </div>

          <!-- Quick Increment Buttons -->
          <div class="d-flex gap-2 mb-4">
            <button type="button" class="btn btn-outline-secondary btn-sm flex-fill rounded-pill" onclick="quickIncrement(20)">+ ₹20</button>
            <button type="button" class="btn btn-outline-secondary btn-sm flex-fill rounded-pill" onclick="quickIncrement(50)">+ ₹50</button>
            <button type="button" class="btn btn-outline-secondary btn-sm flex-fill rounded-pill" onclick="quickIncrement(100)">+ ₹100</button>
          </div>

          <button type="submit" class="btn btn-warning text-dark fw-bold w-100 py-3 rounded-pill fs-5 shadow-sm">
            <i class="fa-solid fa-gavel me-2"></i> Submit Bid Now
          </button>
        </form>

        <div class="mt-4 p-3 bg-light rounded-3 text-muted small">
          <i class="fa-solid fa-shield-halved text-success me-1"></i>
          <strong>Integrity Protected:</strong> Bids once submitted are binding. Server timestamp and validation ensure fair play for all registered traders.
        </div>
      </div>
    </div>
  </div>
</div>

<script>
// Countdown Timer logic
const endTime = new Date("<?php echo date('Y-m-d\TH:i:s', strtotime($auction['end_time'])); ?>").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const diff = endTime - now;
  const timerElem = document.getElementById('countdownTimer');

  if (diff <= 0) {
    timerElem.innerText = "Auction Closed";
    timerElem.classList.remove('text-danger');
    timerElem.classList.add('text-secondary');
    return;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  timerElem.innerText = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function quickIncrement(amount) {
  const current = <?php echo (float)$auction['current_bid']; ?>;
  const input = document.querySelector('input[name="bid_amount"]');
  input.value = current + amount;
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
