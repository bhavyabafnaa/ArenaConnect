DELIMITER //

CREATE DEFINER=`root`@`localhost` PROCEDURE `add_bookings`(
    IN user_id INT,
    IN location_id INT,
    IN booking_date DATE,
    IN requested_slots JSON,
    IN location_fee DECIMAL(10, 2),
    IN total_price DECIMAL(10, 2),
    OUT result_message VARCHAR(255)
)
BEGIN
    DECLARE booked_slots JSON;

    SET booked_slots = (
        SELECT JSON_ARRAYAGG(JSON_UNQUOTE(JSON_EXTRACT(slots, CONCAT('$[', n, ']'))))
        FROM bookings, (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) AS num
        WHERE location_id = location_id 
        AND date = booking_date
        AND JSON_EXTRACT(slots, CONCAT('$[', num.n, ']')) IS NOT NULL
    );

    IF booked_slots IS NOT NULL AND JSON_OVERLAPS(booked_slots, requested_slots) THEN
        SET result_message = 'Error: Booking unavailable for some of the requested slots.';
    ELSE
        IF location_fee <= 0 OR total_price <= 0 THEN
            SET result_message = 'Error: Location fee and total price must be positive values.';
        ELSE
            INSERT INTO bookings (user_id, location_id, date, slots, location_fee, total_price)
            VALUES (user_id, location_id, booking_date, requested_slots, location_fee, total_price);

            SET result_message = 'Booking created successfully.';
        END IF;
    END IF;
END;


DELIMITER ;
