import { param, query, validationResult } from 'express-validator';
import { getLogs, getLogsByEntity } from '../controllers/activityLogController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

export default function (router) {
  router.get('/', protect, requireRole('admin'), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), validate, getLogs);
  router.get('/entity/:id', protect, param('id').isMongoId(), validate, getLogsByEntity);
  return router;
}
