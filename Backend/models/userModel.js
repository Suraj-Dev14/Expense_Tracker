import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  contact: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  }],
  budgets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
  }],
});

const User = mongoose.model("User", userSchema);

export default User;