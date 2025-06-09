import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  addressLine1:{
    type:String,
    required:true
  },
  addressLine2:{
    type:String,
    required:true
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault:{
    type:Boolean,
    default:false
  },
  phone:{
    type:Number,
    required:true
  },
  zipCode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, "Zip code must be exactly 6 digits"],
  },
},{timestamps: true});

export default mongoose.model("Address", addressSchema);