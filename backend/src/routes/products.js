import { body, param, query, validationResult } from 'express-validator';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLifecycleStages,
  getProductStats,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

const createValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').optional().trim(),
  body('currentStage').optional().isIn(['design', 'development', 'testing', 'released']),
  body('currentVersion').optional().matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be semver (e.g. 1.0.0)'),
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('currentStage').optional().isIn(['design', 'development', 'testing', 'released']),
  body('currentVersion').optional().matches(/^\d+\.\d+\.\d+$/),
  body('stageNotes').optional().trim(),
  body('versionNotes').optional().trim(),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Comment too long'),
];

export default function (router) {
  router.get('/stages', getLifecycleStages);
  router.get('/stats', protect, getProductStats);
  router.get('/', protect, query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), validate, getProducts);
  router.get('/:id', protect, param('id').isMongoId(), validate, getProductById);
  router.post('/', protect, requireRole('admin', 'developer'), createValidation, validate, createProduct);
  router.put('/:id', protect, requireRole('admin', 'developer', 'tester'), updateValidation, validate, updateProduct);
  router.delete('/:id', protect, requireRole('admin'), param('id').isMongoId(), validate, deleteProduct);
  return router;
}
