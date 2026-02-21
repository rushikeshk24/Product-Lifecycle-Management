import ActivityLog from '../models/ActivityLog.js';

export const getLogs = async (req, res, next) => {
  try {
    const { userId, entityType, entityId, action, page = 1, limit = 20 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (action) query.action = action;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ActivityLog.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: logs,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    next(err);
  }
};

export const getLogsByEntity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ entityId: req.params.id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
