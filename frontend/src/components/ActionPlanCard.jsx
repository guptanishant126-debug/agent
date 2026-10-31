import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  IndianRupee,
  Volume2,
  VolumeX,
  Share2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speakText, stopSpeech } from '../utils/speech';

export default function ActionPlanCard({ advisory, title = null }) {
  const { t, language } = useLanguage();
  const [openSteps, setOpenSteps] = useState([1]); // step 1 open by default
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!advisory) return null;

  const steps = advisory.steps || [];
  const domain = advisory.domain || 'Operational Advisory';
  const summary = advisory.summary || '';
  const cost = advisory.estimated_cost || 'Zero / Minimal';

  const toggleStep = (stepNumber) => {
    if (openSteps.includes(stepNumber)) {
      setOpenSteps(openSteps.filter((s) => s !== stepNumber));
    } else {
      setOpenSteps([...openSteps, stepNumber]);
    }
  };

  const toggleCompleted = (stepNumber, e) => {
    e.stopPropagation();
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleAudioPlayback = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrationText = `${summary}. Estimated cost is ${cost}. ` +
      steps.map((s) => `Step ${s.step_number}: ${s.action}. Rationale: ${s.rationale}`).join('. ');

    setIsSpeaking(true);
    speakText(narrationText, language, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              {domain}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAudioPlayback}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-900 animate-pulse'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? t('stopAudio') : t('listenAudio')}</span>
            </button>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold mt-3 text-white leading-snug">
          {title || summary}
        </h3>

        {/* Cost & Time Pill */}
        <div className="mt-3 flex items-center space-x-4 text-xs font-medium text-emerald-100">
          <span className="inline-flex items-center space-x-1 bg-emerald-800/60 px-2.5 py-1 rounded-md">
            <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
            <span>Budget: <strong className="text-white">{cost}</strong></span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-emerald-800/60 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>{steps.length} Steps Roadmap</span>
          </span>
        </div>
      </div>

      {/* Accordion Steps List */}
      <div className="p-5 divide-y divide-slate-100">
        {steps.map((step) => {
          const isOpen = openSteps.includes(step.step_number);
          const isDone = completedSteps.includes(step.step_number);

          return (
            <div key={step.step_number} className="py-3 first:pt-0 last:pb-0">
              <div
                onClick={() => toggleStep(step.step_number)}
                className="flex items-start justify-between cursor-pointer group py-2"
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={(e) => toggleCompleted(step.step_number, e)}
                    className={`mt-0.5 flex-shrink-0 transition ${
                      isDone ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isDone ? 'fill-emerald-100' : ''}`} />
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Step {step.step_number}
                      </span>
                      {isDone && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-sm sm:text-base font-bold mt-0.5 transition ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-emerald-700'
                      }`}
                    >
                      {step.action}
                    </h4>
                  </div>
                </div>

                <div className="p-1 rounded-md text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {isOpen && (
                <div className="pl-9 pr-2 pt-1 pb-3 text-xs sm:text-sm text-slate-600 animate-fadeIn">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-medium leading-relaxed">
                      <span className="font-bold text-slate-700">Rationale & Method: </span>
                      {step.rationale}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
