import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import RiskBadge from '../components/RiskBadge';
import ActionPlanCard from '../components/ActionPlanCard';
import ComplaintDraftViewer from '../components/ComplaintDraftViewer';
import {
  History,
  Sparkles,
  ShieldAlert,
  Scale,
  Calendar,
  Search,
  ExternalLink,
  X,
  FileText
} from 'lucide-react';

export default function HistoryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [historyData, setHistoryData] = useState({
    consultations: [],
    scam_reports: [],
    grievances: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await historyAPI.get();
        if (res.data.success && res.data.history) {
          setHistoryData(res.data.history);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const { consultations, scam_reports, grievances } = historyData;

  const filteredConsultations = consultations.filter((c) =>
    (c.raw_input || c.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScams = scam_reports.filter((s) =>
    (s.suspect_identifier || s.scam_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrievances = grievances.filter((g) =>
    (g.incident_summary || g.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Encrypted Citizen Records</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif mt-1">
            {t('history')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Securely stored consultations, detected scams, and official grievance filings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Activity ({consultations.length + scam_reports.length + grievances.length})
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'consultations'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Consultations ({consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scams')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'scams'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Scam Checks ({scam_reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grievances')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'grievances'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Grievances ({grievances.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading your encrypted history...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Consultations Section */}
          {(activeTab === 'all' || activeTab === 'consultations') && filteredConsultations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Operational Consultations</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConsultations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveModalItem({ type: 'consultation', data: item })}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        {item.domain}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-2">
                      {item.raw_input || item.ai_response?.summary || 'Multimodal analysis'}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.ai_response?.summary}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                      <span>View Full Action Plan →</span>
                      <span className="text-slate-400 capitalize">{item.input_type} input</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scam Reports Section */}
          {(activeTab === 'all' || activeTab === 'scams') && filteredScams.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Scam Shield Reports</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScams.map((scam) => (
                  <div
                    key={scam.id}
                    onClick={() => setActiveModalItem({ type: 'scam', data: scam })}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-sm transition cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {scam.scam_type}
                      </span>
                      <RiskBadge
                        riskLevel={scam.analysis_details?.risk_level}
                        score={scam.risk_score}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-800 truncate">
                      {scam.suspect_identifier}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {scam.analysis_details?.explanation}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-amber-700">
                      <span>Inspect Threat Details →</span>
                      <span className="text-slate-400">{new Date(scam.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grievances Section */}
          {(activeTab === 'all' || activeTab === 'grievances') && filteredGrievances.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Official Grievance Petitions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGrievances.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setActiveModalItem({ type: 'grievance', data: g })}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-sm transition cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          g.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {g.status === 'submitted' ? 'Officially Filed' : 'Draft Prepared'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-2">
                      {g.incident_summary}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                      {g.complaint_draft?.slice(0, 120)}...
                    </p>
                    <div className="pt-1 text-[11px] font-bold text-blue-700">
                      <span>View Full Petition Letter →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {consultations.length === 0 && scam_reports.length === 0 && grievances.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your future scam analyses, agricultural consultations, and filed grievances will be listed here with user-level isolation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Record Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {activeModalItem.type} Record
              </h3>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModalItem.type === 'consultation' && (
              <ActionPlanCard
                advisory={activeModalItem.data.ai_response}
                title={activeModalItem.data.raw_input || activeModalItem.data.ai_response?.summary}
              />
            )}

            {activeModalItem.type === 'scam' && (
              <div className="space-y-4">
                <RiskBadge
                  riskLevel={activeModalItem.data.analysis_details?.risk_level}
                  score={activeModalItem.data.risk_score}
                />
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong>Identifier:</strong> {activeModalItem.data.suspect_identifier}
                  <div className="mt-2">
                    <strong>Explanation:</strong> {activeModalItem.data.analysis_details?.explanation}
                  </div>
                  <div className="mt-2 text-red-700 font-bold">
                    <strong>Immediate Action:</strong> {activeModalItem.data.analysis_details?.immediate_action}
                  </div>
                </div>
              </div>
            )}

            {activeModalItem.type === 'grievance' && (
              <ComplaintDraftViewer grievance={activeModalItem.data} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

