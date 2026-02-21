import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'user_login',
        'user_register',
        'product_create',
        'product_update',
        'product_stage_change',
        'product_version_add',
        'product_delete',
      ],
    },
    entityType: {
      type: String,
      enum: ['user', 'product'],
      default: 'product',
    },
    entityId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    comment: { type: String, trim: true, maxlength: 2000 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
