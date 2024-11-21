DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
    -- Check if the new user is an admin
    IF NEW.user_role = 'admin' THEN
        -- Insert into Admins table with the new admin's user_id
        INSERT INTO Admins (user_id) VALUES (NEW.user_id);
    END IF;
END //

DELIMITER ;
