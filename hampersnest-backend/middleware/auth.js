import jwt from 'jsonwebtoken';
import { User } from '../database/models.js';
import { getDefaultPermissions } from '../controllers/authController.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, admin user not found' });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role || 'None'}) is not authorized to access this resource` });
    }
    next();
  };
};

// New: Permission-based middleware
// Checks if the user has a specific module permission
export const requirePermission = (moduleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Super Admin always has full access
    if (req.user.role === 'Super Admin') {
      return next();
    }
    
    const userPermissions = req.user.permissions || getDefaultPermissions(req.user.role);
    
    if (userPermissions.includes(moduleName)) {
      return next();
    }
    
    return res.status(403).json({ message: `You do not have permission to access: ${moduleName}` });
  };
};
