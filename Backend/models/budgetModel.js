import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  spend: {
    type: Number,
    default: 0,
  },
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
