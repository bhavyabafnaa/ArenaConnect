CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateAdminRevenue`(
    IN p_location_id INT,
    IN p_location_fee DECIMAL(10, 2)
)
BEGIN
    DECLARE in_admin_id INT;

    SELECT l.admin_id INTO in_admin_id
    FROM Locations l
    WHERE l.location_id = p_location_id;

    IF in_admin_id IS NOT NULL THEN
        UPDATE admins
        SET total_revenue = total_revenue + p_location_fee
        WHERE admin_id = in_admin_id;
    END IF;
END;
