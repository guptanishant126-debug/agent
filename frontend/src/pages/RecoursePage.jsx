import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { grievanceAPI } from '../services/api';
import ComplaintDraftViewer from '../components/ComplaintDraftViewer';
import HumanApprovalModal from '../components/HumanApprovalModal';
import {
  Scale,
  ShieldAlert,
  Send,
  FileCheck2,
  Calendar,
  IndianRupee,
  Hash,
  UserX,
  Sparkles,
  Building2,
  AlertCircle
} from 'lucide-react';

const INCIDENT_CATEGORIES = [
  "Unauthorized Electronic Debit / UPI Fraud",
  "Phishing Link / Malicious APK Loan App Extortion",
  "Fake Electricity Disconnection Bill Fraud",
  "Spurious Seeds / Defective Agricultural Goods Delivery",
  "Seller Fraud / Refusal of Consumer Refund",
  "Identity Theft & Fake SIM Card Registration"
];

const TARGET_PORTALS = [
  "National Cyber Crime Reporting Portal",
  "National Consumer Helpline (NCH)",
  "RBI Banking Ombudsman"
];

export default function RecoursePage() {
  const { t, language } = useLanguage();
  const location = useLocation();

  const [formData, setFormData] = useState({
    incident_type: location.state?.prefillType || INCIDENT_CATEGORIES[0],
    target_portal: TARGET_PORTALS[0],
    incident_summary: location.state?.prefillSummary || '',
    suspect_details: '',
    amount_lost: '',
    transaction_ref: '',
    date_of_incident: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [generatedGrievance, setGeneratedGrievance] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [submittingOfficial, setSubmittingOfficial] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.incident_summary.trim().length < 10) {
      setErrorMsg('Please provide a brief narration of at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await grievanceAPI.generate({
        ...formData,
        preferred_language: language
      });
      if (res.data.success) {
        setGeneratedGrievance(res.data.grievance);
        setSubmittedSuccess(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to draft complaint petition.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowApprovalModal(false);
    setSubmittingOfficial(true);

    try {
      const res = await grievanceAPI.submit(generatedGrievance.id);
      if (res.data.success) {
        setSubmittedSuccess(res.data.reference_number);
        setGeneratedGrievance({
          ...generatedGrievance,
          status: 'submitted'
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmittingOfficial(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          <span>Official Legal Recourse & Petitions</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
          Grievance & Complaint Wizard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          If financial or consumer harm has occurred, Sahayak AI automatically structures a formal grievance citing the Information Technology Act 2000 and Consumer Protection Act 2019 for National Portals.
        </p>
      </div>

      {/* Submission Success Alert */}
      {submittedSuccess && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-2 shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-base">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            <span>Petition Successfully Authorized & Registered!</span>
          </div>
          <p className="text-xs text-emerald-800">
            Filing Reference Tracking Number: <strong className="font-mono text-sm text-emerald-950">{submittedSuccess}</strong>.
          </p>
          <p className="text-xs text-emerald-700">
            Keep this reference safe. A copy has been saved to your records. Submit this document along with your bank statement at cybercrime.gov.in or directly to your local police cyber cell.
          </p>
        </div>
      )}

      {/* Input Form Wizard */}
      <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Incident & Target Portal Details</span>
        </h3>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Target Official Portal
            </label>
            <select
              name="target_portal"
              value={formData.target_portal}
              onChange={handleChange}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {TARGET_PORTALS.map((portal, idx) => (
                <option key={idx} value={portal}>{portal}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Incident Category
            </label>
            <select
              name="incident_type"
              value={formData.incident_type}
              onChange={handleChange}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {INCIDENT_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Amount Lost (INR)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="amount_lost"
                value={formData.amount_lost}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Bank UTR / UPI Ref ID
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="transaction_ref"
                value={formData.transaction_ref}
                onChange={handleChange}
                placeholder="e.g. 423982716281"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Date of Occurrence
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="date"
                name="date_of_incident"
                value={formData.date_of_incident}
                onChange={handleChange}
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Suspect Details (Phone Numbers, UPI ID, Bank Name, or APK Link)
          </label>
          <div className="relative">
            <UserX className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              name="suspect_details"
              value={formData.suspect_details}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210 / suspect@okaxis / LoanEasy.apk"
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Detailed Summary of What Happened (Chronological order)
          </label>
          <textarea
            required
            name="incident_summary"
            value={formData.incident_summary}
            onChange={handleChange}
            rows={5}
            placeholder="Explain how the person approached you, what promises or threats were made, and how payment was transferred..."
            className="w-full text-sm p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl shadow-md transition cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Drafting Legal Petition with Gemini 2.5 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Official Grievance Petition</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Grievance Draft Viewer */}
      {generatedGrievance && (
        <div className="space-y-4 animate-fadeIn">
          <ComplaintDraftViewer
            grievance={generatedGrievance}
            onApproveSubmit={() => setShowApprovalModal(true)}
            isSubmitting={submittingOfficial}
          />
        </div>
      )}

      {/* Human-in-the-Loop Confirmation Gate Modal */}
      <HumanApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Approve & Register Official Grievance"
        description="Please confirm that you have inspected the drafted complaint letter and all referenced transaction amounts and UTRs are true to the best of your knowledge."
        itemSummary={`${formData.target_portal} • ${formData.incident_type} • Amount: ₹${formData.amount_lost || 0}`}
        confirmText="Authorize & File Complaint"
      />
    </div>
  );
}
