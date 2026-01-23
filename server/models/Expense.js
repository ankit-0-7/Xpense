import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Other' },
  date: { type: Date, default: Date.now },
  description: String,
  isAIProcessed: { type: Boolean, default: false } // To track if AI scanned it
});

export default mongoose.model('Expense', expenseSchema);