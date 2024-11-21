DELIMITER //

CREATE TRIGGER before_booking_insert
BEFORE INSERT ON Bookings
FOR EACH ROW
BEGIN
    DECLARE availability_message VARCHAR(255);

    -- Check slot availability for the new booking
    CALL check_slot_availability(NEW.location_id, NEW.date, NEW.slots);

    -- Retrieve the availability message
    SET availability_message = (SELECT message FROM check_slot_availability);

    -- If slots are unavailable, raise an error to prevent insertion
    IF availability_message LIKE 'Unavailable%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = availability_message;
    END IF;
END //

DELIMITER ;
