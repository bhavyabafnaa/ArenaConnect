DELIMITER //

CREATE TRIGGER 'after_user_insert'
AFTER INSERT ON 'users'
FOR EACH ROW
BEGIN
    IF NEW.user_role = 'admin' THEN
        INSERT INTO Admins (user_id) VALUES (NEW.user_id);
    END IF;
END; //


DELIMITER ;
