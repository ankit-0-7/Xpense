import axios from 'axios';
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeReceipt(fileBuffer, mimeType) {
  try {
    console.log("📤 Sending image to OCR Space...");

    // 1. Convert Image to Base64 for OCR Space
    const base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    // 2. Call OCR Space API
    const ocrResponse = await axios.post(
      'https://api.ocr.space/parse/image',
      {
        apikey: process.env.OCR_SPACE_API_KEY,
        base64Image: base64Image,
        language: 'eng',
        isOverlayRequired: false,
        detectOrientation: true,
        scale: true,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    // Check for OCR errors
    if (ocrResponse.data.IsErroredOnProcessing) {
      throw new Error(`OCR Space Error: ${ocrResponse.data.ErrorMessage}`);
    }

    // Extract Raw Text
    const rawText = ocrResponse.data.ParsedResults?.[0]?.ParsedText;
    if (!rawText) throw new Error("No text found in image.");

    console.log("✅ OCR Success. Raw Text Length:", rawText.length);

    // 3. Use Groq (Llama 3) to Parse Text into JSON
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON extraction bot. Output ONLY raw JSON. No markdown, no comments."
        },
        {
          role: "user",
          content: `Extract the following fields from this receipt text:
          - merchant (store name, or "Unknown")
          - date (YYYY-MM-DD, if missing use today)
          - amount (number only)
          - category (e.g., Food, Travel, Shopping, Bills, Medical)

          Receipt Text:
          """${rawText}"""`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    // Clean and Parse JSON
    const jsonStr = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return result;

  } catch (error) {
    console.error("❌ Scan Service Error:", error.message);
    // Return safe fallback so app doesn't crash
    return {
      merchant: "Scan Failed",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "Other"
    };
  }
}