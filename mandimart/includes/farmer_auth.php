<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'farmer') {
    header("Location: ../login.php?error=farmer_only");
    exit();
}
?>
