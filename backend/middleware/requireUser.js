function requireUser(req, res, next) {
    if (req.user && req.user.user_role === 'user') {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(403).json({ message: 'Forbidden: User access only' });
    }
}

module.exports = requireUser;
