DELIMITER //

CREATE PROCEDURE add_booking(
    IN user_id INT,
    IN location_id INT,
    IN booking_date DATE,
    IN requested_slots JSON,
    IN location_fee DECIMAL(10, 2),
    IN total_price DECIMAL(10, 2),
    OUT result_message VARCHAR(255)
)
BEGIN
    DECLARE unavailable_slots JSON;

    -- Check availability by finding overlapping slots
    SELECT JSON_ARRAYAGG(slot)
    INTO unavailable_slots
    FROM (
        SELECT JSON_EXTRACT(slots, CONCAT('$[', idx, ']')) AS slot
        FROM Bookings,
             JSON_TABLE(slots, "$[*]" COLUMNS(idx FOR ORDINALITY)) jt
        WHERE location_id = location_id
          AND date = booking_date
          AND JSON_CONTAINS(requested_slots, JSON_EXTRACT(slots, CONCAT('$[', idx, ']'))) > 0
    ) sub
    WHERE slot IS NOT NULL;

    -- If unavailable slots are found, set result_message and exit
    IF unavailable_slots IS NOT NULL THEN
        SET result_message = CONCAT('Unavailable slots: ', JSON_UNQUOTE(unavailable_slots));
    ELSE
        -- If all requested slots are available, proceed to insert the booking
        INSERT INTO Bookings (user_id, location_id, date, slots, location_fee, total_price)
        VALUES (user_id, location_id, booking_date, requested_slots, location_fee, total_price);

        -- Set success message
        SET result_message = 'Booking created successfully';
    END IF;
END //

DELIMITER ;
