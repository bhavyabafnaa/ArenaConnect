function requireAdmin(req, res, next) {
    if (req.user && req.user.user_role === 'admin') {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
}

module.exports = requireAdmin;
