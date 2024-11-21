CREATE DEFINER=`root`@`localhost` PROCEDURE `get_bookings_by_location`(
    IN locationId INT
)
BEGIN
    SELECT
        b.booking_id,
        u.username AS user_name,
        DATE_FORMAT(b.date, '%Y-%m-%d') AS date,
        b.slots,
        b.location_fee
    FROM
        bookings b
    JOIN
        users u ON b.user_id = u.user_id
    WHERE
        b.location_id = locationId
    ORDER BY
        b.date DESC;
END;
