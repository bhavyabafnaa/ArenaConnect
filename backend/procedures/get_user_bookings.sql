DELIMITER //

CREATE PROCEDURE get_user_bookings(
    IN user_id INT
)
BEGIN
    SELECT 
        b.booking_id, 
        l.location_name, 
        l.city, 
        l.sport, 
        DATE_FORMAT(b.date, '%Y-%m-%d') AS date, -- Format date as string
        b.slots, 
        b.total_price
    FROM 
        Bookings b
    JOIN 
        Locations l ON b.location_id = l.location_id
    WHERE 
        b.user_id = user_id
    ORDER BY 
        b.date DESC;
END //

DELIMITER ;
