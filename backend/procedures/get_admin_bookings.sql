DELIMITER //

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetAdminBookings`(
    IN p_admin_id INT
)
BEGIN
    SELECT
        b.booking_id,
        u.username,
        l.location_name,
        DATE_FORMAT(b.date, '%Y-%m-%d') AS date,
        b.slots,
        b.location_fee
    FROM bookings b
    JOIN locations l ON b.location_id = l.location_id
    JOIN users u ON b.user_id = u.user_id
    WHERE l.admin_id = p_admin_id
    ORDER BY b.date DESC;
END;


DELIMITER ;
