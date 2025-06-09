import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
    trim: true,
  },
  phone:{
    type: String,
    required: true,
    unique: [true, "Phone number already exists"],
    trim: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
  },
  password:{
    type:String,
    required:true
  },      //from register route 
  isVerified:{     //for otp 
    type:Boolean,
    default:false
  },
  role:{   
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  addresses:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Address",
  }],
  cart:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  wishlist:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wishlist",
  },
  otp:{    //for otp verify 
    type:Number,
    default: null,
  },
  otpExpires:{
    type: Date,
    default: null,
  },
},{timestamps: true});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);