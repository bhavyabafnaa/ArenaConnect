DELIMITER //

CREATE PROCEDURE check_slot_availability(
    IN location INT,
    IN booking_date DATE
)
BEGIN
    DECLARE unavailable_slots JSON DEFAULT JSON_ARRAY();
    DECLARE available_slots JSON DEFAULT JSON_ARRAY(1, 2, 3, 4);

    -- Find booked slots for the specified date and location
    SELECT JSON_ARRAYAGG(slot) INTO unavailable_slots
    FROM (
        SELECT JSON_EXTRACT(slots, CONCAT('$[', idx, ']')) AS slot
        FROM Bookings,
             JSON_TABLE(slots, "$[*]" COLUMNS(idx FOR ORDINALITY)) jt
        WHERE location_id = location
          AND DATE(date) = DATE(booking_date)  -- Matches only the exact date without time
    ) sub
    WHERE slot IS NOT NULL;

    -- If there are bookings for that date and location, filter out the booked slots
    IF unavailable_slots IS NOT NULL THEN
        -- Clear available_slots to start filtering out the unavailable slots
        SET available_slots = JSON_ARRAY();

        -- Check each slot (1 to 4) and add it to available_slots if it is not in unavailable_slots
        IF JSON_CONTAINS(unavailable_slots, JSON_QUOTE("1")) = 0 THEN
            SET available_slots = JSON_ARRAY_APPEND(available_slots, '$', 1);
        END IF;
        IF JSON_CONTAINS(unavailable_slots, JSON_QUOTE("2")) = 0 THEN
            SET available_slots = JSON_ARRAY_APPEND(available_slots, '$', 2);
        END IF;
        IF JSON_CONTAINS(unavailable_slots, JSON_QUOTE("3")) = 0 THEN
            SET available_slots = JSON_ARRAY_APPEND(available_slots, '$', 3);
        END IF;
        IF JSON_CONTAINS(unavailable_slots, JSON_QUOTE("4")) = 0 THEN
            SET available_slots = JSON_ARRAY_APPEND(available_slots, '$', 4);
        END IF;
    END IF;

    -- Return available slots along with the requested date
    SELECT available_slots AS available_slots, DATE_FORMAT(booking_date, '%Y-%m-%d') AS requested_date;
END //

DELIMITER ;
