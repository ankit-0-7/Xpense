// import { GoogleGenAI } from "@google/genai";

// export const analyzeReceipt = async (fileBuffer, mimeType) => {
//   // Initialize with the 2026 Unified SDK
//   // It looks for GOOGLE_API_KEY in your .env by default
//   const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  
//   // Use the 2026 stable preview model
//   const modelName = "gemini-3-flash";

//   const prompt = `
//     Analyze this document (receipt/invoice/bill). 
//     Extract the following data and return it as a JSON object:
//     - merchant: Name of the vendor.
//     - amount: Total amount paid as a number.
//     - category: Assign one from [Food, Travel, Shopping, Bills, Other].
//   `;

//   try {
//     console.log(`Analyzing ${mimeType} with ${modelName}...`);
    
//     const response = await ai.models.generateContent({
//       model: modelName,
//       contents: [
//         {
//           role: 'user',
//           parts: [
//             { text: prompt },
//             {
//               inlineData: {
//                 // Ensure raw base64 string without data-url prefix
//                 data: fileBuffer.toString("base64"),
//                 mimeType: mimeType
//               }
//             }
//           ]
//         }
//       ],
//       config: {
//         // Force output to be pure JSON
//         response_mime_type: "application/json"
//       }
//     });

//     // Parse and return the clean JSON object
//     return JSON.parse(response.text);

//   } catch (error) {
//     console.error("❌ Analysis Error:", error.message);
    
//     if (error.message.includes("400")) {
//       throw new Error("Invalid file format or corrupt data. Please try a different file.");
//     }
//     throw new Error("AI Processing failed: " + error.message);
//   }
// };

import axios from 'axios';
import FormData from 'form-data';

export const analyzeReceipt = async (fileBuffer, mimeType) => {
  const API_KEY = process.env.OCR_SPACE_API_KEY;
  
  const form = new FormData();
  
  // 1. Add parameters first
  form.append('apikey', API_KEY);
  form.append('language', 'eng');
  form.append('isTable', 'true');
  form.append('OCREngine', '2');
  
  // 2. Add the file with a specific filename
  const extension = mimeType.split('/')[1] || 'jpg';
  form.append('file', fileBuffer, {
    filename: `scan.${extension}`,
    contentType: mimeType,
  });

  try {
    console.log(`🚀 Sending ${mimeType} (${(fileBuffer.length / 1024).toFixed(1)} KB) to OCR.space...`);

    // 3. The "No-Fail" Axios Configuration
    const response = await axios({
      method: 'post',
      url: 'https://api.ocr.space/parse/image',
      data: form.getBuffer(), // Send the raw compiled buffer
      headers: {
        ...form.getHeaders(), // Let the form library set the Content-Type + Boundary
        'Content-Length': form.getLengthSync() // Tell the server exactly how much data to expect
      },
      timeout: 30000
    });

    if (response.data.IsErroredOnProcessing) {
      const msg = response.data.ErrorMessage ? response.data.ErrorMessage[0] : "Scan failed";
      throw new Error(msg);
    }

    if (!response.data.ParsedResults) {
      throw new Error("E301: Server returned no parsed results. Check image clarity.");
    }

    const rawText = response.data.ParsedResults[0].ParsedText;
    return parseReceiptText(rawText);

  } catch (error) {
    console.error("❌ OCR Detailed Failure:", error.message);
    throw new Error(error.message);
  }
};

// ... keep your parseReceiptText function from the previous step ...

const parseReceiptText = (text) => {
  if (!text) return { merchant: "Unknown", amount: 0, category: "Other" };
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const merchant = lines[0] || "Unknown";
  const amounts = text.match(/\d+\.\d{2}/g) || [];
  const total = amounts.length > 0 ? Math.max(...amounts.map(Number)) : 0;

  return { merchant, amount: total, category: "Other" };
};