CREATE TRIGGER `after_booking_insert`
AFTER INSERT ON `bookings`
FOR EACH ROW
BEGIN
    CALL UpdateAdminRevenue(NEW.location_id, NEW.location_fee);
END;
