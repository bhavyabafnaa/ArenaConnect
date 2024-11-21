CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUnavailableSlots`(
    IN p_location_id INT,
    IN p_date DATE
)
BEGIN
    DECLARE all_slots JSON;
    DECLARE booked_slots JSON;
    DECLARE missing_slots JSON;
    DECLARE i INT DEFAULT 0;

    SET all_slots = JSON_ARRAY(1, 2, 3, 4);

    SET booked_slots = (
        SELECT JSON_ARRAYAGG(JSON_UNQUOTE(JSON_EXTRACT(slots, CONCAT('$[', n, ']'))))
        FROM bookings, (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) AS num
        WHERE location_id = p_location_id 
        AND date = p_date
        AND JSON_EXTRACT(slots, CONCAT('$[', num.n, ']')) IS NOT NULL
    );

    IF booked_slots IS NULL THEN
        SET missing_slots = all_slots;
    ELSE
        SET missing_slots = JSON_ARRAY();

        WHILE i < JSON_LENGTH(all_slots) DO
            IF JSON_SEARCH(booked_slots, 'one', JSON_UNQUOTE(JSON_EXTRACT(all_slots, CONCAT('$[', i, ']')))) IS NULL THEN
                SET missing_slots = JSON_ARRAY_APPEND(missing_slots, '$', JSON_UNQUOTE(JSON_EXTRACT(all_slots, CONCAT('$[', i, ']'))));
            END IF;
            SET i = i + 1;
        END WHILE;
    END IF;

    SELECT missing_slots AS available_slots;
END;
