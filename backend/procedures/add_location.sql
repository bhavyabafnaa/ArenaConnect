DELIMITER //

CREATE PROCEDURE add_location(
    IN admin INT,
    IN loc_name VARCHAR(100),
    IN loc_city VARCHAR(50),
    IN loc_sport VARCHAR(50),
    IN loc_price DECIMAL(10,2)
)
BEGIN
    INSERT INTO Locations (admin_id, location_name, city, sport, price_per_3_hours)
    VALUES (admin, loc_name, loc_city, loc_sport, loc_price);
END //

DELIMITER ;
