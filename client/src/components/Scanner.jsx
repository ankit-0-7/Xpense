import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Scanner = ({ onScanComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      // Send the photo to the /api/scan route we built in Phase 3
      const response = await axios.post('http://localhost:5000/api/scan', formData);
      onScanComplete(response.data); // Refresh the list
    } catch (error) {
      alert("AI Scanning failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95">
        {loading ? <Loader2 className="animate-spin" /> : <Camera />}
        {loading ? "AI is Reading..." : "Scan Receipt"}
        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
      </label>
      {loading && <p className="text-purple-300 animate-pulse text-sm">Analyzing merchant, amount, and category...</p>}
    </div>
  );
};

export default Scanner;