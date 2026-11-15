/**
 * Role-based authorization middleware.
 * Verifies that the authenticated user possesses the required role.
 *
 * Example: requireRole('farmer') or requireRole('consumer')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required. Access denied.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        message: `Forbidden: this action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
};

module.exports = requireRole;

