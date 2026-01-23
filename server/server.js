import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { analyzeReceipt } from './services/aiService.js';
import Expense from './models/Expense.js';

const app = express();

// Middleware
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- CRITICAL FIX: Switch to Memory Storage ---
// This ensures req.file.buffer is populated for OCR.space
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB Limit for OCR.space Free Tier
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// Routes
app.get('/', (req, res) => res.send("Server is running! 🚀"));

app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const newExpense = new Expense({
      title,
      amount: Number(amount),
      category: category || 'Other',
      date: date || Date.now(),
      isAIProcessed: false 
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ message: "Error saving expense" });
  }
});

// --- CRITICAL FIX: Update Scan Route ---
app.post('/api/scan', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Ensure the field name is 'receipt'" });
    }

    console.log(`🚀 Processing ${req.file.originalname} (${req.file.size} bytes)`);

    // Pass the buffer and mimetype directly to the service
    const extractedData = await analyzeReceipt(req.file.buffer, req.file.mimetype);
    
    const newExpense = new Expense({
      title: extractedData.merchant,
      amount: extractedData.amount,
      category: extractedData.category,
      date: new Date(),
      isAIProcessed: true
    });

    await newExpense.save();
    res.json(newExpense);
  } catch (error) {
    console.error("❌ Scan Error:", error.message);
    res.status(500).json({ error: error.message || "AI Scanning failed." });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));