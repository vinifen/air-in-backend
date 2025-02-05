SET @db_name = 'air_in_db';
/* ***If you want to change the database name, change it here and also change the command 
   'USE air_in_db;' */

SET @user = 'root';
SET @host = 'localhost';    
SET @password = 'abc321';

SET @sql = CONCAT('CREATE DATABASE IF NOT EXISTS ', @db_name, ';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SELECT COUNT(*) INTO @exist FROM mysql.user WHERE user = @user AND host = @host;


SET @sql = IF(@exist = 0, 
    CONCAT('CREATE USER "', @user, '"@"', @host, '" IDENTIFIED BY "', @password, '";'), 
    'SELECT "User already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @sql = CONCAT('GRANT ALL PRIVILEGES ON ', @db_name, '.* TO "', @user, '"@"', @host, '" WITH GRANT OPTION;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

FLUSH PRIVILEGES;




USE air_in_db; 
/* ***If you want to change the database name, change it here and also change the command 
   SET @db_name = 'air_in_db'; */




CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    public_id CHAR(36) UNIQUE NOT NULL
);


CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_users INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    public_id CHAR(36) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (id_users) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_users INT NOT NULL,
    name VARCHAR(255),
    FOREIGN KEY (id_users) REFERENCES users(id) ON DELETE CASCADE
);


CREATE EVENT delete_refresh_tokens ON SCHEDULE EVERY 1 HOUR 
DO 
DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL 7 DAY;


SET GLOBAL event_scheduler = ON;







