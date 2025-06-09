import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers']
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative'],
    validate: {
      validator: function(value) {
        if (this.discountType === 'percentage') {
          return value <= 100;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
  minimumPurchase: {
    type: Number,
    min: [0, 'Minimum purchase cannot be negative'],
    default: 0
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validTo: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.validFrom;
      },
      message: 'End date must be after start date'
    }
  },
  usageLimit: {
    type: Number,
    min: [0, 'Usage limit cannot be negative'],
    default: 0 // 0 means unlimited
  },
  currentUsage: {
    type: Number,
    min: [0, 'Current usage cannot be negative'],
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative'],
    default: null // null means no maximum
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true 
});

// Index for frequently queried fields
couponSchema.index({ validFrom: 1, validTo: 1 });
couponSchema.index({ isActive: 1 });

// Pre-save hook to update the updatedAt field
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validTo &&
    (this.usageLimit === 0 || this.currentUsage < this.usageLimit)
  );
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;