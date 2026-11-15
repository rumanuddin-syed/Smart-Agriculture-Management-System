const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['farmer', 'consumer', 'admin'],
      default: 'farmer'
    },
    location: {
      city: { type: String, default: 'Green Valley' },
      state: { type: String, default: 'Agricultural Region' },
      lat: { type: Number, default: 20.5937 },
      lng: { type: Number, default: 78.9629 }
    }
  },
  { timestamps: true }
);

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
