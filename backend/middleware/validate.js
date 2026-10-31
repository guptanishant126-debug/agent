import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  preferred_language: z.string().default('en')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const scamCheckSchema = z.object({
  suspect_identifier: z.string().min(1, 'Suspect identifier (message, URL, or number) is required'),
  scam_type: z.string().min(1, 'Scam type or suspected category is required'),
  preferred_language: z.string().optional().default('en')
});

export const consultSchema = z.object({
  domain: z.enum(['Agricultural Advisory', 'Small Business & Retail', 'Financial Fraud & Scams', 'Consumer Rights & Legal Recourse']).default('Agricultural Advisory'),
  raw_input: z.string().max(5000, 'Text must not exceed 5,000 characters').optional().default(''),
  preferred_language: z.string().optional().default('en')
});

export const grievanceGenerateSchema = z.object({
  incident_type: z.string().min(1, 'Incident type is required'),
  incident_summary: z.string().min(10, 'Incident summary must be at least 10 characters'),
  suspect_details: z.string().optional().default('Not known / Anonymous'),
  amount_lost: z.string().optional().default('N/A'),
  transaction_ref: z.string().optional().default('N/A'),
  date_of_incident: z.string().optional().default(new Date().toISOString().split('T')[0]),
  preferred_language: z.string().optional().default('en'),
  target_portal: z.enum(['National Cyber Crime Reporting Portal', 'National Consumer Helpline (NCH)', 'RBI Banking Ombudsman']).default('National Cyber Crime Reporting Portal')
});

export const grievanceSubmitSchema = z.object({
  grievance_id: z.string().uuid('Valid grievance ID is required'),
  confirmation: z.literal(true, {
    errorMap: () => ({ message: 'Human-in-the-loop explicit confirmation is required before submitting official complaints.' })
  })
});

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
};
