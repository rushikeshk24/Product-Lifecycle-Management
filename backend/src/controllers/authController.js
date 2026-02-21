import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logActivityManual } from '../middleware/activityLogger.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role });
    await logActivityManual({
      action: 'user_register',
      entityType: 'user',
      entityId: user._id,
      details: { email: user.email },
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    await logActivityManual({
      action: 'user_login',
      entityType: 'user',
      entityId: user._id,
      details: { email: user.email },
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    const token = generateToken(user._id);
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
