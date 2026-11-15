<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/response.php';
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
function signed_in_user(): ?array { return $_SESSION['user'] ?? null; }
function require_login(?string $role = null): array
{
    $user = signed_in_user();
    if (!$user) json_response(['message' => 'Silakan login terlebih dahulu.'], 401);
    if ($role && $user['role'] !== $role) json_response(['message' => 'Akses tidak diizinkan.'], 403);
    return $user;
}
function require_admin_page(): array
{
    $user = signed_in_user();
    if (!$user || $user['role'] !== 'admin') { header('Location: login.php'); exit; }
    return $user;
}
