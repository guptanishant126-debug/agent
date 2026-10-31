import db from '../config/db.js';
import { analyzeScamInput } from '../services/geminiService.js';
import { saveBufferToDisk } from '../middleware/upload.js';

export const checkScamRisk = async (req, res) => {
  try {
    const userId = req.user.id;
    const { suspect_identifier, scam_type = 'Suspected Fraudulent Message / URL', preferred_language } = req.body;
    const lang = preferred_language || req.user.preferred_language || 'en';

    let fileBuffer = null;
    let mimeType = null;
    let mediaUrl = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      mediaUrl = saveBufferToDisk(fileBuffer, req.file.originalname, mimeType);
    }

    const aiResult = await analyzeScamInput({
      text: `${scam_type}: ${suspect_identifier}`,
      buffer: fileBuffer,
      mimeType,
      preferredLanguage: lang
    });

    const riskScore = aiResult.confidence_score || (aiResult.risk_level === 'CRITICAL' ? 95 : aiResult.risk_level === 'HIGH' ? 85 : aiResult.risk_level === 'MEDIUM' ? 60 : 20);

    // Save to scam_reports table
    const result = await db.query(
      `INSERT INTO scam_reports (user_id, suspect_identifier, scam_type, risk_score, analysis_details)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, suspect_identifier, scam_type, riskScore, JSON.stringify(aiResult)]
    );

    return res.status(200).json({
      success: true,
      report: {
        id: result.rows[0].id,
        suspect_identifier,
        scam_type,
        risk_score: riskScore,
        media_url: mediaUrl,
        analysis_details: aiResult,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Scam analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze scam risk: ' + error.message
    });
  }
};

export const getCommunityScamAlerts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, suspect_identifier, scam_type, risk_score, created_at, analysis_details
       FROM scam_reports
       ORDER BY created_at DESC LIMIT 6`
    );

    // Seeded alerts if empty so the UI looks active
    const sampleAlerts = [
      {
        id: 'sample-1',
        suspect_identifier: '+91-98765-XXXXX / Bijli Bill Notice',
        scam_type: 'Fake Electricity Disconnection SMS',
        risk_score: 95,
        analysis_details: {
          threat_type: 'Phishing SMS urging download of QuickSupport APK',
          explanation: 'Fraudsters send SMS claiming power will be disconnected at 9:30 PM due to unpaid bill.'
        },
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'sample-2',
        suspect_identifier: 'refund-pmkisan-gov.in.cc',
        scam_type: 'Fake PM Kisan Subsidy Phishing URL',
        risk_score: 92,
        analysis_details: {
          threat_type: 'Malicious clone of official PM-Kisan portal',
          explanation: 'Asks farmers to input Aadhaar and OTP to claim ₹6,000 installment.'
        },
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'sample-3',
        suspect_identifier: 'paytm-merchant-qr-scan2pay',
        scam_type: 'Reverse UPI QR Code Fraud',
        risk_score: 88,
        analysis_details: {
          threat_type: 'Fake buyer asking shopkeeper to scan QR to "receive" money',
          explanation: 'Scanning a QR code and entering UPI PIN DEBITS money; it never credits.'
        },
        created_at: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    const reports = result.rows.length > 0 ? result.rows : sampleAlerts;

    return res.status(200).json({
      success: true,
      alerts: reports
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
