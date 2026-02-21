import { body, validationResult } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'developer', 'tester']).withMessage('Invalid role'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export default function (router) {
  router.post('/register', registerValidation, validate, register);
  router.post('/login', loginValidation, validate, login);
  router.get('/me', protect, getMe);
  return router;
}
