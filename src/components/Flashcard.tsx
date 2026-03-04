import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Info, Volume2, Loader2, Check, X, Heart } from 'lucide-react';
import { MedicalTerm, weekThemes } from '../data/terms';
import { generateSpeech } from '../services/ttsService';

interface FlashcardProps {
  term: MedicalTerm;
  isKnown?: boolean;
  isFavorite?: boolean;
  onToggleKnown?: () => void;
  onToggleFavorite?: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  term, 
  isKnown, 
  isFavorite, 
  onToggleKnown, 
  onToggleFavorite 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      const audioUrl = await generateSpeech(term.term);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  // Auto-play audio when term changes
  React.useEffect(() => {
    setIsFlipped(false);
    handlePlayAudio();
  }, [term.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="relative w-full max-w-md aspect-[4/5] sm:aspect-[3/2] cursor-pointer perspective-1000 group"
      onClick={handleFlip}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFlipped ? 'back' : 'front'}
          initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full rounded-[2.5rem] shadow-xl flex flex-col items-center p-6 sm:p-8 border-2 ${
            isFlipped 
              ? 'bg-primary-light border-primary/20 text-primary' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Top Controls */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className={`p-2 rounded-lg transition-all ${
                isFavorite 
                  ? 'bg-rose-100 text-rose-500' 
                  : isFlipped ? 'text-primary/40 hover:text-rose-500 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <div className={`transition-colors p-2 ${isFlipped ? 'text-primary/40' : 'text-slate-400 group-hover:text-primary'}`}>
              <RotateCw size={18} />
            </div>
          </div>
          
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-wrap items-center gap-1 sm:gap-2 max-w-[60%]">
            {(term.category || term.week) && (
              <div className="flex flex-col items-start gap-1">
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  isFlipped ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {term.category || `${term.week}주차`}
                </span>
                {term.week && weekThemes[term.week] && (
                  <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1 ${
                    isFlipped ? 'text-primary/60' : 'text-slate-400'
                  }`}>
                    {weekThemes[term.week]}
                  </span>
                )}
              </div>
            )}
            {isKnown && (
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center gap-1 whitespace-nowrap">
                <Check size={10} />
                완벽! ✨
              </span>
            )}
          </div>

          <div className="text-center px-2 w-full flex flex-col items-center justify-center flex-1 mt-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 break-words font-sans">
              {isFlipped ? term.meaning : term.term}
            </h2>
            <p className="text-xs sm:text-sm opacity-60 uppercase tracking-widest font-medium mb-8">
              {isFlipped ? '뜻 (Meaning)' : '의학 용어 (Term)'}
            </p>

            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all border ${
                isPlaying 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : isFlipped ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-white text-primary border-primary/20 hover:bg-primary/5'
              }`}
              title="발음 듣기"
            >
              {isPlaying ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
              <span className="text-[10px] font-bold uppercase tracking-widest">발음 듣기</span>
            </button>
          </div>

          {/* Bottom Action Buttons - Only visible when flipped (Korean side) */}
          <div className="w-full min-h-[60px] flex items-end justify-center">
            <AnimatePresence>
              {isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full flex justify-center gap-3 mb-4"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isKnown) onToggleKnown?.();
                    }}
                    className={`flex-1 max-w-[140px] flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                      !isKnown 
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <X size={14} />
                    아직 몰라요
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isKnown) onToggleKnown?.();
                    }}
                    className={`flex-1 max-w-[140px] flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                      isKnown 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95' 
                        : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Check size={14} />
                    다 외웠어요!
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-1 text-[8px] text-slate-300 font-medium uppercase tracking-tighter">
              <Info size={10} />
              클릭해서 뒤집어보세요
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Flashcard;
