import db from '../config/db.js';
import { generateAdvisoryPlan, analyzeScamInput } from '../services/geminiService.js';
import { saveBufferToDisk } from '../middleware/upload.js';

export const handleConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { domain = 'Agricultural Advisory', raw_input = '', preferred_language } = req.body;
    const lang = preferred_language || req.user.preferred_language || 'en';

    let inputType = 'text';
    let mediaUrl = null;
    let fileBuffer = null;
    let mimeType = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) {
        inputType = 'image';
      } else if (mimeType.startsWith('audio/')) {
        inputType = 'audio';
      }
      mediaUrl = saveBufferToDisk(fileBuffer, req.file.originalname, mimeType);
    }

    if (!raw_input && !fileBuffer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a text description, a photo, or an audio recording.'
      });
    }

    let aiResult;
    if (domain === 'Financial Fraud & Scams') {
      aiResult = await analyzeScamInput({
        text: raw_input,
        buffer: fileBuffer,
        mimeType,
        preferredLanguage: lang
      });
    } else {
      aiResult = await generateAdvisoryPlan({
        domain,
        text: raw_input,
        buffer: fileBuffer,
        mimeType,
        preferredLanguage: lang
      });
    }

    // Save to PostgreSQL database (RLS user_id isolation)
    const dbResult = await db.query(
      `INSERT INTO consultations (user_id, domain, input_type, raw_input, media_url, ai_response, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, domain, inputType, raw_input, mediaUrl, JSON.stringify(aiResult), 'completed']
    );

    return res.status(200).json({
      success: true,
      data: {
        id: dbResult.rows[0].id,
        domain,
        input_type: inputType,
        media_url: mediaUrl,
        raw_input,
        ai_response: aiResult,
        created_at: dbResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Consultation processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process consultation: ' + error.message
    });
  }
};

