import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    required: true,
    trim: true,
  },
  description:{
    type:String
  },
  image:{
    type: String,
    required: true,
  },
  subCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);