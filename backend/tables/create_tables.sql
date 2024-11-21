

CREATE TABLE admins (
    admin_id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (admin_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE bookings (
    booking_id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    location_id INT DEFAULT NULL,
    date DATE NOT NULL,
    slots JSON NOT NULL,
    slots_text VARCHAR(255) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(slots, '$'))) STORED,
    location_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL
);

CREATE TABLE locations (
    location_id INT NOT NULL AUTO_INCREMENT,
    location_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    price_per_3_hours DECIMAL(10, 2) NOT NULL,
    admin_id INT NOT NULL,
    max_capacity INT DEFAULT NULL,
    PRIMARY KEY (location_id),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_role ENUM('user', 'admin') DEFAULT 'user',
    PRIMARY KEY (user_id)
);
