const roleMiddleware = (roles) => {
  return (req, res, next) => {
    const userType = req.user?.userType || req.user?.role; // fallback if old tokens exist
    if (!roles.includes(userType)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permission.' });
    }
    next();
  };
};

module.exports = roleMiddleware;
