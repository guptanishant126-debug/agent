import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileCheck2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ComplaintDraftViewer({
  grievance,
  onApproveSubmit = null,
  isSubmitting = false
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!grievance) return null;

  const draftText = grievance.complaint_draft || '';
  const metadata = grievance.structured_metadata || {};
  const laws = metadata.relevant_laws || [];
  const evidenceList = metadata.recommended_evidence || [];
  const urgentSteps = metadata.urgent_next_steps || [];
  const portal = metadata.target_portal || 'National Cyber Crime Reporting Portal';
  const status = grievance.status || 'draft';

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sahayak_Grievance_${grievance.id || Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {portal}
            </span>
            <span
              className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                status === 'submitted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status === 'submitted' ? 'Officially Filed' : 'Pending Approval (Draft)'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            {metadata.subject_line || 'Formal Grievance Petition Draft'}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : t('copyDraft')}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadDraft')}</span>
          </button>
        </div>
      </div>

      {/* Relevant Legal Grounds & Laws */}
      {laws.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5 mb-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Applicable Legal Statutes & Acts</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {laws.map((law, idx) => (
              <span
                key={idx}
                className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
              >
                ⚖️ {law}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Draft Letter Body */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Official Complaint Letter Text
        </label>
        <div className="bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm p-5 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-emerald-500 selection:text-white">
          {draftText}
        </div>
      </div>

      {/* Recommended Evidence & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidenceList.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-700" />
              <span>Mandatory Evidence Checklist</span>
            </h5>
            <ul className="text-xs text-amber-900 space-y-1.5">
              {evidenceList.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {urgentSteps.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
            <h5 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              <span>Urgent Recourse Steps (Within 24 Hours)</span>
            </h5>
            <ul className="text-xs text-red-900 space-y-1.5">
              {urgentSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Human-in-the-loop Approval Action */}
      {status === 'draft' && onApproveSubmit && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                {t('officialFilingWarning')}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Review the drafted legal representation above. Your explicit consent is required before committing to the official registry.
              </p>
            </div>
          </div>

          <button
            onClick={onApproveSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Official Petition...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>{t('approveAndSubmit')}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

