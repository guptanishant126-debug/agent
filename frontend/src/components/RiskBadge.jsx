import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RiskBadge({ riskLevel = 'LOW', score = 0, size = 'md' }) {
  const { t } = useLanguage();
  const level = (riskLevel || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badge: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500',
      label: t('riskLow'),
      icon: ShieldCheck,
      description: 'Safe / Routine Communication'
    },
    MEDIUM: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      badge: 'bg-amber-500 text-white',
      dot: 'bg-amber-500',
      label: t('riskMedium'),
      icon: AlertTriangle,
      description: 'Suspicious Elements Detected'
    },
    HIGH: {
      bg: 'bg-orange-50 border-orange-200 text-orange-900',
      badge: 'bg-orange-600 text-white',
      dot: 'bg-orange-600',
      label: t('riskHigh'),
      icon: ShieldAlert,
      description: 'High Scam Likelihood'
    },
    CRITICAL: {
      bg: 'bg-red-50 border-red-300 text-red-900',
      badge: 'bg-red-700 text-white',
      dot: 'bg-red-600',
      label: t('riskCritical'),
      icon: AlertOctagon,
      description: 'Active Financial Cyber Threat'
    }
  };

  const current = configs[level] || configs.LOW;
  const IconComponent = current.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${current.bg}`}>
        <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`}></span>
        <IconComponent className="w-3.5 h-3.5" />
        <span>{current.label}</span>
        {score > 0 && <span className="opacity-75">({score}%)</span>}
      </span>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${current.bg} shadow-sm transition`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${current.badge} shadow-sm`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-extrabold tracking-tight">{current.label}</h4>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${current.badge}`}>
                {level}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{current.description}</p>
          </div>
        </div>

        {score > 0 && (
          <div className="text-right">
            <span className="text-2xl font-black">{score}%</span>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('confidence')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
