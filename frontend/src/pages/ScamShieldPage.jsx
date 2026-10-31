import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { scamAPI } from '../services/api';
import MultimodalInputHub from '../components/MultimodalInputHub';
import RiskBadge from '../components/RiskBadge';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  FileText,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle,
  Sparkles,
  Link as LinkIcon,
  Phone,
  MessageSquare
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';

const SCAM_PRESETS = [
  {
    title: "Electricity Power Cut SMS",
    type: "Phishing SMS / Fake Utility Disconnection",
    text: "Dear Customer, Your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately contact our electricity officer at +91-9876543210 or install official bill update APK."
  },
  {
    title: "Reverse UPI QR Code Scam",
    type: "UPI Payment Reversal Fraud",
    text: "Buyer on OLX says: 'I have sent you advance payment of ₹4,500. Scan this QR code on PhonePe/GooglePay and enter your UPI PIN to claim credit into your bank account.'"
  },
  {
    title: "PM-Kisan ₹6000 Subsidy Link",
    type: "Government Scheme Impersonation Phishing",
    text: "Government of India has released ₹6,000 under PM Kisan Samman Nidhi. Click pmkisan-bonus-claim.online to link your Aadhaar card and withdraw funds immediately."
  },
  {
    title: "Part-Time YouTube Like Scam",
    type: "Task Based Telegram Investment Fraud",
    text: "Earn ₹3,000 to ₹8,000 daily by simply liking YouTube videos. Work from home 30 minutes a day. Message our HR manager on Telegram @EarnFastIndia."
  }
];

export default function ScamShieldPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [scamType, setScamType] = useState('UPI / Payment / Phishing Threat');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleScan = async (formData, { text }) => {
    formData.append('suspect_identifier', text || 'Attached Multimodal Screenshot / Audio Recording');
    formData.append('scam_type', scamType);

    setLoading(true);
    setScanResult(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const res = await scamAPI.check(formData);
      if (res.data.success) {
        setScanResult(res.data.report);
      }
    } catch (err) {
      console.error('Scam analysis failed:', err);
      alert(err.response?.data?.message || 'Scam analysis failed. Please check input.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPlayback = (text) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const applyPreset = (preset) => {
    setScamType(preset.type);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = preset.text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Real-Time Threat Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
          Scam & Fraud Shield
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Instantly verify suspicious WhatsApp forwards, phone numbers, fake APK links, and UPI payment requests. Gemini 2.5 Flash analyzes linguistic deception and threat indicators.
        </p>
      </div>

      {/* Preset Common Threat Badges */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Try Pre-Loaded Fraud Scenarios:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SCAM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition text-xs space-y-1 shadow-2xs"
            >
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{preset.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{preset.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Hub */}
      <MultimodalInputHub
        onSubmit={handleScan}
        loading={loading}
        placeholder="Paste suspect phone number (+91-XXXXX), WhatsApp message, bank debit text, or link..."
        buttonText="Scan Message with Scam Shield"
      />

      {/* Analysis Result Card */}
      {scanResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                Verification Report
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {scanResult.analysis_details?.threat_type || 'Threat Assessment'}
              </h3>
            </div>
            <button
              onClick={() => {
                const text = `${scanResult.analysis_details?.explanation}. Immediate safety action: ${scanResult.analysis_details?.immediate_action}`;
                handleAudioPlayback(text);
              }}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-900 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? t('stopAudio') : t('listenAudio')}</span>
            </button>
          </div>

          {/* Visual Risk Badge */}
          <RiskBadge
            riskLevel={scanResult.analysis_details?.risk_level}
            score={scanResult.risk_score}
          />

          {/* Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Why this is flagged:
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed font-medium">
              {scanResult.analysis_details?.explanation}
            </div>
          </div>

          {/* Immediate Action Alert Box */}
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-red-900 font-extrabold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-700" />
              <span>{t('immediateAction')}</span>
            </div>
            <p className="text-xs sm:text-sm text-red-950 font-semibold leading-relaxed">
              {scanResult.analysis_details?.immediate_action}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:1930"
                className="inline-flex items-center space-x-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Cyber Helpline 1930</span>
              </a>

              {/* If money lost, trigger grievance generator */}
              <button
                onClick={() =>
                  navigate('/recourse', {
                    state: {
                      prefillSummary: scanResult.suspect_identifier,
                      prefillType: scanResult.analysis_details?.threat_type || 'Financial Cyber Fraud'
                    }
                  })
                }
                className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Have you lost money? File Official Grievance →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

