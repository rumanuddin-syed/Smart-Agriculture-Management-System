const mongoose = require('mongoose');

const cultivationExpenseSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: [
        'Seeds',
        'Fertilizers',
        'Pesticides',
        'Organic Treatments',
        'Irrigation',
        'Labour',
        'Equipment',
        'Transport',
        'Packaging',
        'Land Preparation',
        'Other'
      ],
      required: [true, 'Expense category is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    cropName: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    receiptUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CultivationExpense', cultivationExpenseSchema);

