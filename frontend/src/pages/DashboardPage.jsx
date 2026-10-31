import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { historyAPI, scamAPI } from '../services/api';
import {
  ShieldAlert,
  Sprout,
  Store,
  Scale,
  Sparkles,
  PhoneCall,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_consultations: 0,
    total_scams_detected: 0,
    total_grievances_filed: 0
  });
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [recentScams, setRecentScams] = useState([]);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await historyAPI.get();
        if (res.data.success) {
          setStats(res.data.stats || stats);
          setRecentConsultations(res.data.history?.consultations?.slice(0, 3) || []);
          setRecentScams(res.data.history?.scam_reports?.slice(0, 3) || []);
          setRecentGrievances(res.data.history?.grievances?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/60 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Shield Active (Gemini 2.5 Flash)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            Namaste, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Here is your live security and operational center. Verify suspicious messages, ask farming/business questions, and safeguard your livelihood.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/scam-shield')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>Scan Fraud</span>
          </button>
          <button
            onClick={() => navigate('/consult')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Ask Advice</span>
          </button>
        </div>
      </div>

      {/* 4 Quantitative Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Consultations
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.total_consultations}
            </span>
            <span className="text-xs text-slate-400">queries</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scams Flagged
            </span>
            <span className="p-2 bg-red-50 text-red-700 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600">
              {stats.total_scams_detected}
            </span>
            <span className="text-xs text-slate-400">threats blocked</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Grievances Filed
            </span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              {stats.total_grievances_filed}
            </span>
            <span className="text-xs text-slate-400">official petitions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Helpline 1930
            </span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <PhoneCall className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-lg font-black text-emerald-600">24x7 Active</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/scam-shield')}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-3xl hover:shadow-md transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-amber-950">Verify UPI & WhatsApp Scam</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Upload screenshot of payment failure, SMS threat, or unknown caller number for instant AI analysis.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 group-hover:underline">
            <span>Launch Scam Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => navigate('/consult?domain=Agricultural%20Advisory')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-3xl hover:shadow-md transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <Sprout className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-emerald-950">Crop Pest & Fertilizer Action Plan</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Attach leaf photo or describe crop blight to receive low-cost bio-remedies and spraying schedules.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 group-hover:underline">
            <span>Get Farming Advice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => navigate('/recourse')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-3xl hover:shadow-md transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-blue-950">Draft Cyber Police / NCH Petition</h3>
          <p className="text-xs text-blue-800 leading-relaxed">
            Create an official complaint letter formatted for National Cyber Crime Portal or Consumer Forum.
          </p>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 group-hover:underline">
            <span>Start Grievance Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Scam Checks */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Recent Scam Checks</h3>
            </div>
            <Link to="/history" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              View All ({stats.total_scams_detected})
            </Link>
          </div>

          {recentScams.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No scam queries recorded yet. Keep yourself safe by checking suspicious messages!
            </div>
          ) : (
            <div className="space-y-3">
              {recentScams.map((scam) => (
                <div
                  key={scam.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {scam.suspect_identifier}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {scam.scam_type} • {new Date(scam.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <RiskBadge
                    riskLevel={scam.analysis_details?.risk_level || (scam.risk_score >= 80 ? 'HIGH' : 'LOW')}
                    score={scam.risk_score}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Consultations</h3>
            </div>
            <Link to="/history" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              View All ({stats.total_consultations})
            </Link>
          </div>

          {recentConsultations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No operational consultations yet. Try asking Sahayak for a crop or inventory plan!
            </div>
          ) : (
            <div className="space-y-3">
              {recentConsultations.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {c.domain}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {c.raw_input || c.ai_response?.summary || 'Multimodal inspection'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
