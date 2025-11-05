<?php
// send.php
// WYMAGA: PHPMailer (https://github.com/PHPMailer/PHPMailer)
// Jeśli wgrywasz ręcznie, zrób folder phpmailer i dołącz autoload:
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';
require __DIR__ . '/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false]); exit;
}

$honeypot = $_POST['_honeypot'] ?? '';
if ($honeypot) { echo json_encode(['ok'=>true]); exit; } // bot

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$name || !$email || !$message || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok'=>false, 'error'=>'validation']); exit;
}

$to = 'wojtekszutryk@gmail.com'; // <-- mail odbiorcy
$subject = 'Nowe zgłoszenie z formularza — Pewny Odbiór';
$body = "Imię i nazwisko: $name\nEmail: $email\nTelefon: $phone\n\nTreść:\n$message";

try {
  $mail = new PHPMailer(true);
  $mail->CharSet = 'UTF-8';
  $mail->isSMTP();
  $mail->Host = 'serwer2599835.home.pl'; // <-- host SMTP
  $mail->SMTPAuth = true;
  $mail->Username = 'wojtek@pewnyodbiordomu.pl'; // <-- login skrzynki
  $mail->Password = 'Przemek123?';               // <-- hasło
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // TLS -> ENCRYPTION_STARTTLS + port 587
  $mail->Port = 465;

  $mail->setFrom('wojtek@pewnyodbiordomu.pl', 'Formularz — Pewny Odbiór');
  $mail->addAddress($to);
  $mail->addReplyTo($email, $name);

  $mail->Subject = $subject;
  $mail->Body    = $body;

  $mail->send();
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false, 'error'=>'mailer']);
}
