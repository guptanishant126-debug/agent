import db from '../config/db.js';
import { generateOfficialGrievance } from '../services/geminiService.js';

export const generateGrievance = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      incident_type,
      incident_summary,
      suspect_details,
      amount_lost,
      transaction_ref,
      date_of_incident,
      target_portal = 'National Cyber Crime Reporting Portal',
      preferred_language
    } = req.body;

    const lang = preferred_language || req.user.preferred_language || 'en';

    const aiDraft = await generateOfficialGrievance({
      incident_type,
      incident_summary,
      suspect_details,
      amount_lost,
      transaction_ref,
      date_of_incident,
      target_portal,
      preferredLanguage: lang
    });

    const complaintText = aiDraft.complaint_draft || '';

    // Insert as 'draft' in grievances table
    const result = await db.query(
      `INSERT INTO grievances (user_id, incident_summary, complaint_draft, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, incident_summary, complaintText, 'draft']
    );

    return res.status(200).json({
      success: true,
      grievance: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        incident_summary: result.rows[0].incident_summary,
        complaint_draft: result.rows[0].complaint_draft,
        structured_metadata: aiDraft,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Grievance generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate official grievance draft: ' + error.message
    });
  }
};

/**
 * Human-In-The-Loop Approval Gate:
 * Mandatory confirmation prompt before submitting official complaints or triggering high-stakes automated tasks.
 */
export const approveAndSubmitGrievance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { grievance_id, confirmation } = req.body;

    if (!confirmation) {
      return res.status(400).json({
        success: false,
        message: 'Explicit user approval is required to submit this official petition.'
      });
    }

    // Verify ownership and update status to 'submitted'
    const result = await db.query(
      `UPDATE grievances
       SET status = 'submitted'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      ['submitted', grievance_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grievance record not found or not owned by user.'
      });
    }

    const submissionReference = `SAHAYAK-CMP-${Date.now().toString().slice(-6)}`;

    return res.status(200).json({
      success: true,
      message: 'Grievance petition successfully approved and registered for official filing.',
      reference_number: submissionReference,
      grievance: result.rows[0]
    });
  } catch (error) {
    console.error('Grievance submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit grievance: ' + error.message
    });
  }
};

export const listGrievances = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM grievances WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({
      success: true,
      grievances: result.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

