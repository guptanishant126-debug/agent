import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HumanApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Official Submission Confirmation",
  description = "Are you sure you want to proceed with this high-stakes action?",
  itemSummary = "",
  confirmText = "Yes, I Authorize Submission"
}) {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!agreed) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Human-In-The-Loop Safety Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description & Summary Box */}
        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
          <p>{description}</p>
          {itemSummary && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
              {itemSummary}
            </div>
          )}
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>
            Official petitions once registered will notify police nodal desks or banking grievance ombudsmen. Ensure all transaction references are accurate.
          </span>
        </div>

        {/* Checkbox Acknowledgment */}
        <label className="flex items-start space-x-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-700 font-medium">
            I verify that I have reviewed the generated complaint and authorize Sahayak AI to submit/register this legal petition on my behalf.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={handleConfirm}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
