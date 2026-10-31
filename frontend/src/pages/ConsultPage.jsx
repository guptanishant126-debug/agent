import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { consultAPI } from '../services/api';
import MultimodalInputHub from '../components/MultimodalInputHub';
import ActionPlanCard from '../components/ActionPlanCard';
import RiskBadge from '../components/RiskBadge';
import {
  Sprout,
  Store,
  ShieldAlert,
  Scale,
  Sparkles,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';

const DOMAINS = [
  { id: 'Agricultural Advisory', label: 'Agricultural Advisory', icon: Sprout, color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
  { id: 'Small Business & Retail', label: 'Small Business & Retail', icon: Store, color: 'text-blue-700 bg-blue-50 border-blue-300' },
  { id: 'Financial Fraud & Scams', label: 'Financial Fraud & Scams', icon: ShieldAlert, color: 'text-amber-700 bg-amber-50 border-amber-300' },
  { id: 'Consumer Rights & Legal Recourse', label: 'Consumer Rights & Legal Recourse', icon: Scale, color: 'text-purple-700 bg-purple-50 border-purple-300' }
];

const PROMPT_TEMPLATES = {
  'Agricultural Advisory': [
    "My tomato crop has yellow spots and curling leaves after rains. What low-cost organic spray should I use?",
    "Aphids / sucking pests on mustard crop. How to control with neem oil spray?",
    "Wheat crop soil preparation: Recommended Trichoderma and cow dung manure ratio?"
  ],
  'Small Business & Retail': [
    "Customer has ₹14,000 pending udhaar for 60 days. How to send polite WhatsApp reminder with UPI link?",
    "Kirana store inventory: How to decide which FMCG items to stock more during festival season?",
    "Distributor refusing to replace expired biscuits carton. How to resolve dispute?"
  ],
  'Financial Fraud & Scams': [
    "Received SMS: 'Dear Customer, your electricity power will be disconnected at 9:30 PM. Call officer immediately'.",
    "Someone sent a QR code on WhatsApp asking me to scan it to 'receive' ₹5,000 payment for goods.",
    "Unknown app called 'FastCash Instant Loan' sent link on SMS asking for contact list permission."
  ],
  'Consumer Rights & Legal Recourse': [
    "Paid ₹3,500 online for hybrid seeds but got useless spurious seeds. Seller not picking up calls.",
    "Mobile recharge failed but money was deducted from bank account 4 days ago. Bank says pending.",
    "Electronics shop refused to honor manufacturer warranty for water pump."
  ]
};

export default function ConsultPage() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialDomain = searchParams.get('domain') || 'Agricultural Advisory';

  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [consultationResult, setConsultationResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const d = searchParams.get('domain');
    if (d && DOMAINS.some((item) => item.id === d)) {
      setSelectedDomain(d);
    }
  }, [searchParams]);

  const handleSubmit = async (formData) => {
    formData.append('domain', selectedDomain);
    setLoading(true);
    setConsultationResult(null);
    stopSpeech();
    setIsSpeaking(false);

    try {
      const res = await consultAPI.submit(formData);
      if (res.data.success) {
        setConsultationResult(res.data.data);
      }
    } catch (err) {
      console.error('Consultation failed:', err);
      alert(err.response?.data?.message || 'Consultation request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioScamPlayback = (explanation, action) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(`${explanation}. Immediate action: ${action}`, language, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Multimodal Advisory Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
          Consult Sahayak AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Upload photos of crop leaves, bills, or messages, record voice notes, or type in your regional language. Gemini 2.5 Flash will reason and structure an immediate action plan.
        </p>
      </div>

      {/* Domain Selection Tabs */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Select Your Domain / Situation
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isSelected = selectedDomain === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  setSelectedDomain(domain.id);
                  setConsultationResult(null);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition cursor-pointer ${
                  isSelected
                    ? `${domain.color} ring-2 ring-emerald-500/50 shadow-sm font-bold`
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5" />
                  {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-xs font-bold">{domain.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Questions for {selectedDomain}:
        </span>
        <div className="flex flex-wrap gap-2">
          {PROMPT_TEMPLATES[selectedDomain]?.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const el = document.querySelector('textarea');
                if (el) {
                  el.value = prompt;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="text-left bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl transition"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Multimodal Input Hub */}
      <MultimodalInputHub
        onSubmit={handleSubmit}
        loading={loading}
        placeholder={`Describe your ${selectedDomain.toLowerCase()} situation in detail, or speak using the microphone...`}
        buttonText={`Ask Sahayak AI for ${selectedDomain}`}
      />

      {/* Results Workspace */}
      {consultationResult && (
        <div className="space-y-6 pt-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Sahayak Advisory & Analysis</span>
            </h3>
            <span className="text-xs text-slate-500">
              Processed by Gemini 2.5 Flash
            </span>
          </div>

          {/* Render Scam / Fraud analysis if domain was fraud */}
          {consultationResult.domain === 'Financial Fraud & Scams' || consultationResult.ai_response?.is_scam !== undefined ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <RiskBadge
                riskLevel={consultationResult.ai_response?.risk_level}
                score={consultationResult.ai_response?.confidence_score}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Threat Assessment & Explanation
                  </h4>
                  <button
                    onClick={() =>
                      handleAudioScamPlayback(
                        consultationResult.ai_response?.explanation,
                        consultationResult.ai_response?.immediate_action
                      )
                    }
                    className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                      isSpeaking ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? t('stopAudio') : t('listenAudio')}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-medium">
                  {consultationResult.ai_response?.explanation}
                </div>
              </div>

              {/* Immediate Action Callout */}
              <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-700" />
                  <span>Immediate Safety Action Required</span>
                </span>
                <p className="text-xs sm:text-sm font-bold text-red-950">
                  {consultationResult.ai_response?.immediate_action}
                </p>
                {consultationResult.ai_response?.recommended_helpline && (
                  <p className="text-xs text-red-800 pt-1">
                    📞 Helpline: <strong>{consultationResult.ai_response?.recommended_helpline}</strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Render Operational Action Plan Accordion */
            <ActionPlanCard
              advisory={consultationResult.ai_response}
              title={consultationResult.ai_response?.summary}
            />
          )}
        </div>
      )}
    </div>
  );
}

