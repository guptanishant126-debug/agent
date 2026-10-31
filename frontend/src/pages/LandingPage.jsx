import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sprout,
  Store,
  Scale,
  Sparkles,
  PhoneCall,
  CheckCircle,
  ArrowRight,
  Mic,
  Languages,
  AlertTriangle,
  Lock,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { scamAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await scamAPI.getAlerts();
        if (res.data.success && res.data.alerts) {
          setAlerts(res.data.alerts);
        }
      } catch (err) {
        // Fallback default alerts handled gracefully
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Multimodal AI Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-serif max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/scam-shield')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-slate-950" />
              <span>{t('checkScamNow')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/consult')}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{t('startConsultation')}</span>
            </button>
          </div>

          {/* Vernacular Language Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Languages Supported:</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">हिंदी</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">বাংলা</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">தமிழ்</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">తెలుగు</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">मराठी</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">ગુજરાતી</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-200">English</span>
          </div>
        </div>
      </section>

      {/* Golden Hour Emergency Recourse Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-red-900/80 border border-red-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span>Golden Hour Fraud Protocol (First 2 Hours)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {t('emergencyActionHeader')}
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              {t('emergencyActionBody')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="tel:1930"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-red-50 text-red-900 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition"
            >
              <PhoneCall className="w-4 h-4 text-red-700" />
              <span>{t('call1930')}</span>
            </a>
            <Link
              to="/recourse"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-red-950/70 hover:bg-red-950 text-white font-bold text-sm px-5 py-3.5 rounded-2xl border border-red-400/40 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Cyber Police Petition</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Tailored Domains
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
            Designed for Bharat's Farmers & Shopkeepers
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Multimodal artificial intelligence tuned to resolve grassroot problems with high practical impact and zero technical barriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Fraud & Scam Shield */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('fraudDomain')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify forwarded WhatsApp messages, fake power disconnection threats, deceptive lottery calls, and reverse UPI QR codes.
            </p>
            <Link
              to="/scam-shield"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Scan messages & numbers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Agricultural Advisory */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('agricultureDomain')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload crop photos to diagnose fungal wilt, sucking pests, and nutrient deficiencies. Get low-cost bio-control recipes under ₹300.
            </p>
            <Link
              to="/consult?domain=Agricultural%20Advisory"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Get crop guidance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Small Business & Retail */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('retailDomain')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resolve Kirana store cash-flow crunches, recover customer ledger udhaar politely, and optimize distributor purchasing margins.
            </p>
            <Link
              to="/consult?domain=Small%20Business%20%26%20Retail"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              <span>Optimize shop operations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Consumer Rights & Legal Recourse */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('consumerDomain')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-generate formal legal notices, Consumer Court petitions, and Cybercrime portal filings with exact legal citations.
            </p>
            <Link
              to="/recourse"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              <span>Draft official petition</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Scam Alerts Live Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {t('recentScamAlerts')}
            </h3>
          </div>
          <Link
            to="/scam-shield"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Check Any Identifier →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.slice(0, 3).map((alert, idx) => (
            <div
              key={alert.id || idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded">
                  {alert.scam_type || 'Active Scam'}
                </span>
                <span className="text-xs font-black text-red-600">
                  {alert.risk_score || 90}% Risk
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 truncate">
                {alert.suspect_identifier}
              </p>
              <p className="text-xs text-slate-600 line-clamp-2">
                {alert.analysis_details?.explanation || alert.analysis_details?.threat_type || 'High fraud alert.'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

