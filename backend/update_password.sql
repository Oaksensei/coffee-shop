USE coffee_shop;

UPDATE users 
SET password_hash = '$2a$10$vnwuoSse1z5SEjF5YEY/YeKhvIX6tvLszYl6gFVNbpBw/H2/Ej9xa' 
WHERE username = 'admin';

SELECT username, password_hash FROM users WHERE username = 'admin';
