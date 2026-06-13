import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../database/models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hampersnest_super_secret_key_123';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '30d'
      });

      res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify token and return user info
// @route   GET /api/auth/verify
// @access  Private
export const verifyUser = async (req, res) => {
  try {
    res.json({
      _id: req.user.id,
      username: req.user.username,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
