import ActivityLog from '../models/ActivityLog.js';

export const logActivity = (action, entityType = 'product') => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        ActivityLog.create({
          action,
          entityType,
          entityId: body?.data?.id || body?.data?._id || req.params?.id,
          details: body?.data ? { name: body.data.name } : {},
          userId: req.user._id,
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent'),
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

export const logActivityManual = async (payload) => {
  try {
    await ActivityLog.create(payload);
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}
