import db from '../config/db.js';

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Row-Level Security: Filter explicitly by authenticated user's id
    const consultationsResult = await db.query(
      `SELECT id, domain, input_type, raw_input, media_url, ai_response, status, created_at
       FROM consultations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const scamReportsResult = await db.query(
      `SELECT id, suspect_identifier, scam_type, risk_score, analysis_details, created_at
       FROM scam_reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const grievancesResult = await db.query(
      `SELECT id, incident_summary, complaint_draft, status, created_at
       FROM grievances
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        total_consultations: consultationsResult.rows.length,
        total_scams_detected: scamReportsResult.rows.filter(s => s.risk_score >= 80).length,
        total_grievances_filed: grievancesResult.rows.filter(g => g.status === 'submitted').length
      },
      history: {
        consultations: consultationsResult.rows,
        scam_reports: scamReportsResult.rows,
        grievances: grievancesResult.rows
      }
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user history: ' + error.message
    });
  }
};
