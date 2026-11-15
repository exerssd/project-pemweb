<?php
function request_data(): array
{
    $raw = file_get_contents('php://input');
    if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') && $raw !== '') {
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}
function clean_string(mixed $value, int $max = 255): string { return mb_substr(trim((string) $value), 0, $max); }
function order_number(): string { return 'VS-' . strtoupper(bin2hex(random_bytes(4))); }
function e(mixed $value): string { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); }
