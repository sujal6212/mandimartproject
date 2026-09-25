<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'buyer') {
    header("Location: ../login.php?error=buyer_only");
    exit();
}
?>
