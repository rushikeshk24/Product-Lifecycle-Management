import mongoose from 'mongoose';

const LIFECYCLE_STAGES = ['design', 'development', 'testing', 'released'];

const productVersionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      match: [/^\d+\.\d+\.\d+$/, 'Version must be semver (e.g. 1.0.0)'],
    },
    stage: {
      type: String,
      enum: LIFECYCLE_STAGES,
      default: 'design',
    },
    notes: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    currentStage: {
      type: String,
      enum: LIFECYCLE_STAGES,
      default: 'design',
    },
    currentVersion: {
      type: String,
      default: '0.0.0',
      match: [/^\d+\.\d+\.\d+$/, 'Version must be semver (e.g. 1.0.0)'],
    },
    versions: [productVersionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ currentStage: 1 });
productSchema.index({ createdAt: -1 });

export const LIFECYCLE_STAGES_LIST = LIFECYCLE_STAGES;
export default mongoose.model('Product', productSchema);
