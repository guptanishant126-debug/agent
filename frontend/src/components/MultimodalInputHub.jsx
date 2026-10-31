import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Mic,
  Square,
  Image as ImageIcon,
  FileAudio,
  X,
  Play,
  Pause,
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

export default function MultimodalInputHub({
  onSubmit,
  loading = false,
  placeholder = null,
  buttonText = null,
  acceptedMimeTypes = 'image/*,audio/*'
}) {
  const { t, language } = useLanguage();
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const speechRecognizerRef = useRef(null);

  // Clean up timers & object URLs
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (filePreview && typeof filePreview === 'string' && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [recordedAudioUrl, filePreview]);

  // Handle File Selection
  const handleFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    if (!isImage && !isAudio) {
      setErrorMsg('Unsupported file type. Please upload an image (JPEG, PNG, WebP) or audio recording (WAV, MP3, WebM).');
      return;
    }

    if (isImage && file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    if (isAudio && file.size > 25 * 1024 * 1024) {
      setErrorMsg('Audio size exceeds 25MB limit.');
      return;
    }

    setSelectedFile(file);
    if (isImage) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(file.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Browser MediaRecorder for live voice notes
  const startAudioRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording failed:', err);
      setErrorMsg('Microphone access denied or unavailable in this browser.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const clearRecordedAudio = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  // Speech Recognition (Speech-to-Text) in native language
  const toggleSpeechToText = () => {
    if (isListeningSpeech) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsListeningSpeech(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Voice dictation is not supported on this browser. Try Chrome or Edge.');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        language,
        (transcript) => {
          setTextInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsListeningSpeech(false);
        },
        () => {
          setIsListeningSpeech(false);
        }
      );

      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
        setIsListeningSpeech(true);
      }
    } catch (err) {
      console.error(err);
      setIsListeningSpeech(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() && !selectedFile && !recordedAudioBlob) {
      setErrorMsg('Please enter a description, attach a file, or record a voice note.');
      return;
    }

    setErrorMsg('');
    const formData = new FormData();
    if (textInput.trim()) {
      formData.append('raw_input', textInput.trim());
    }
    formData.append('preferred_language', language);

    if (selectedFile) {
      formData.append('media', selectedFile);
    } else if (recordedAudioBlob) {
      const audioFile = new File([recordedAudioBlob], `voicenote-${Date.now()}.webm`, { type: 'audio/webm' });
      formData.append('media', audioFile);
    }

    onSubmit(formData, {
      text: textInput,
      hasMedia: !!(selectedFile || recordedAudioBlob)
    });
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 space-y-4">
      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder={placeholder || t('typeYourQuery')}
          className="w-full text-slate-800 text-sm sm:text-base placeholder-slate-400 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-y"
        />

        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          {/* Mic dictation button */}
          <button
            type="button"
            onClick={toggleSpeechToText}
            title={isListeningSpeech ? 'Stop Voice Dictation' : 'Dictate in your language'}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              isListeningSpeech
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{isListeningSpeech ? 'Listening...' : 'Voice Dictate'}</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {textInput.length}/5000
          </span>
        </div>
      </div>

      {/* Multimodal Attachments Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* File Drag-and-Drop / Browse Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 flex items-center justify-center cursor-pointer transition ${
            dragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedMimeTypes}
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-between w-full px-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2 truncate">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <FileAudio className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                </span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-1">
              <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">
                {t('dropFileOrClick')}
              </p>
              <p className="text-[10px] text-slate-400">Photo / Bill / Screenshot / Audio</p>
            </div>
          )}
        </div>

        {/* Voice Note Recorder Box */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
          {recordedAudioUrl ? (
            <div className="flex items-center justify-between w-full space-x-2">
              <div className="flex items-center space-x-2">
                <FileAudio className="w-5 h-5 text-emerald-600" />
                <audio controls src={recordedAudioUrl} className="h-8 max-w-[180px] sm:max-w-[200px]" />
              </div>
              <button
                type="button"
                onClick={clearRecordedAudio}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
                title="Discard audio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : isRecording ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
                <span className="text-xs font-mono font-bold text-red-600">
                  Recording: {formatTimer(recordingSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopAudioRecording}
                className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('stopRecording')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-700">{t('recordVoice')}</p>
                  <p className="text-[10px] text-slate-500">Audio voice note for Gemini 2.5</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startAudioRecording}
                className="inline-flex items-center space-x-1 bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Thumbnail if selected */}
      {filePreview && selectedFile?.type?.startsWith('image/') && (
        <div className="relative inline-block mt-2">
          <img
            src={filePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-xl border border-slate-300 shadow-sm"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Submit Trigger */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/30 transition transform active:scale-95 text-sm sm:text-base cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('analyzingInput')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{buttonText || t('submitForAnalysis')}</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

