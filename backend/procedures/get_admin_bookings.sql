DELIMITER //

CREATE PROCEDURE get_admin_bookings(
    IN admin_id INT
)
BEGIN
    SELECT b.booking_id, b.user_id, b.location_id, b.date, b.slots
    FROM Bookings b
    JOIN Locations l ON b.location_id = l.location_id
    WHERE l.admin_id = admin_id
    ORDER BY b.date DESC;
END //

DELIMITER ;
