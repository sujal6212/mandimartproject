<?php
/**
 * MandiMart - Core Helper Functions & Security
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function get_current_user_role() {
    return $_SESSION['user_role'] ?? null;
}

function format_currency($amount) {
    return '₹' . number_format((float)$amount, 2);
}

function create_notification($pdo, $user_id, $title, $message) {
    if (!$pdo) return false;
    try {
        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
        return $stmt->execute([$user_id, $title, $message]);
    } catch (Exception $e) {
        return false;
    }
}
?>
