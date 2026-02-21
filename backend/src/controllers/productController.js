import Product, { LIFECYCLE_STAGES_LIST } from '../models/Product.js';
import { logActivityManual } from '../middleware/activityLogger.js';
import {
  isAllowedStageTransition,
  getTransitionErrorMessage,
  isInvalidTransitionTarget,
} from '../utils/workflow.js';

export const getProducts = async (req, res, next) => {
  try {
    const { stage, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (stage) query.currentStage = stage;
    if (search && search.trim()) {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: new RegExp(term, 'i') },
        { description: new RegExp(term, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('versions.changedBy', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      versions: [
        {
          version: req.body.currentVersion || '0.0.0',
          stage: req.body.currentStage || 'design',
          notes: 'Initial version',
          changedBy: req.user.id,
        },
      ],
    });
    await logActivityManual({
      action: 'product_create',
      entityType: 'product',
      entityId: product._id,
      details: { name: product.name },
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    const populated = await Product.findById(product._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const role = req.user.role;
    const { name, description, currentStage, currentVersion } = req.body;

    // --- Strict role-based workflow ---
    // Tester: may only update stage (Development → Testing). Optional comment stored in ActivityLog.
    // Developer: may edit name, description, version; may only move Design → Development.
    // Admin: may edit all details and delete; may only move Testing → Released.
    // Invalid transitions → 400; unauthorized role for transition → 403.

    // Tester: may only update stage (Development → Testing). No detail edits.
    if (role === 'tester') {
      const hasDetailChange = name !== undefined || description !== undefined || currentVersion !== undefined;
      if (hasDetailChange) {
        return res.status(403).json({
          success: false,
          message: 'Testers can only move products from Development to Testing. Product details can be edited by Developer or Admin.',
        });
      }
      if (currentStage === undefined) {
        return res.status(400).json({ success: false, message: 'No changes provided.' });
      }
      if (isInvalidTransitionTarget(product.currentStage, currentStage)) {
        return res.status(400).json({
          success: false,
          message: getTransitionErrorMessage(product.currentStage, currentStage, role),
        });
      }
      if (!isAllowedStageTransition(product.currentStage, currentStage, role)) {
        return res.status(403).json({
          success: false,
          message: getTransitionErrorMessage(product.currentStage, currentStage, role),
        });
      }
      product.currentStage = currentStage;
      product.versions.push({
        version: product.currentVersion,
        stage: currentStage,
        notes: req.body.stageNotes || 'Moved to Testing',
        changedBy: req.user.id,
      });
      product.updatedBy = req.user.id;
      await product.save();
      // Store optional tester comment in activity log (e.g. approval notes for Admin)
      await logActivityManual({
        action: 'product_stage_change',
        entityType: 'product',
        entityId: product._id,
        details: { name: product.name, stage: currentStage },
        comment: req.body.comment ? String(req.body.comment).trim() : undefined,
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      const populated = await Product.findById(product._id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('versions.changedBy', 'name email');
      return res.json({ success: true, data: populated });
    }

    // Developer: may edit details and only move Design → Development
    if (role === 'developer') {
      if (currentStage !== undefined && currentStage !== product.currentStage) {
        if (isInvalidTransitionTarget(product.currentStage, currentStage)) {
          return res.status(400).json({
            success: false,
            message: getTransitionErrorMessage(product.currentStage, currentStage, role),
          });
        }
        if (!isAllowedStageTransition(product.currentStage, currentStage, role)) {
          return res.status(403).json({
            success: false,
            message: getTransitionErrorMessage(product.currentStage, currentStage, role),
          });
        }
      }
    }

    // Admin: may edit details and only move Testing → Released
    if (role === 'admin' && currentStage !== undefined && currentStage !== product.currentStage) {
      if (isInvalidTransitionTarget(product.currentStage, currentStage)) {
        return res.status(400).json({
          success: false,
          message: getTransitionErrorMessage(product.currentStage, currentStage, role),
        });
      }
      if (!isAllowedStageTransition(product.currentStage, currentStage, role)) {
        return res.status(403).json({
          success: false,
          message: getTransitionErrorMessage(product.currentStage, currentStage, role),
        });
      }
    }

    // Apply allowed updates
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (currentStage !== undefined && currentStage !== product.currentStage) {
      product.currentStage = currentStage;
      product.versions.push({
        version: product.currentVersion,
        stage: currentStage,
        notes: req.body.stageNotes || 'Stage updated',
        changedBy: req.user.id,
      });
      await logActivityManual({
        action: 'product_stage_change',
        entityType: 'product',
        entityId: product._id,
        details: { name: product.name, stage: currentStage },
        comment: req.body.comment ? String(req.body.comment).trim() : undefined,
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
    if (currentVersion !== undefined) {
      product.currentVersion = currentVersion;
      product.versions.push({
        version: currentVersion,
        stage: product.currentStage,
        notes: req.body.versionNotes || 'Version bump',
        changedBy: req.user.id,
      });
      await logActivityManual({
        action: 'product_version_add',
        entityType: 'product',
        entityId: product._id,
        details: { name: product.name, version: currentVersion },
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
    product.updatedBy = req.user.id;
    await product.save();
    await logActivityManual({
      action: 'product_update',
      entityType: 'product',
      entityId: product._id,
      details: { name: product.name },
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    const populated = await Product.findById(product._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('versions.changedBy', 'name email');
    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await logActivityManual({
      action: 'product_delete',
      entityType: 'product',
      entityId: product._id,
      details: { name: product.name },
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
};

export const getLifecycleStages = (req, res) => {
  res.json({ success: true, data: LIFECYCLE_STAGES_LIST });
};

/**
 * Dashboard analytics: product counts by lifecycle stage.
 * Used for dashboard cards (Total, Design, Development, Testing, Released).
 */
export const getProductStats = async (req, res, next) => {
  try {
    const [total, design, development, testing, released] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ currentStage: 'design' }),
      Product.countDocuments({ currentStage: 'development' }),
      Product.countDocuments({ currentStage: 'testing' }),
      Product.countDocuments({ currentStage: 'released' }),
    ]);
    res.json({
      success: true,
      data: { total, design, development, testing, released },
    });
  } catch (err) {
    next(err);
  }
};
