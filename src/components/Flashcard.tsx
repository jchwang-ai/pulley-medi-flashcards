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
  onNext?: () => void;
  onPrev?: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  term, 
  isKnown, 
  isFavorite, 
  onToggleKnown, 
  onToggleFavorite,
  onNext,
  onPrev
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      const success = generateSpeech(term.term);
      if (success) {
        // Since window.speechSynthesis doesn't have a simple 'onended' for the whole system here,
        // we'll just reset isPlaying after a short delay or use the utterance events if we had access.
        // For simplicity with the current ttsService, we'll just toggle it back.
        setTimeout(() => setIsPlaying(false), 1000);
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  // Reset state when term changes
  React.useEffect(() => {
    setIsFlipped(false);
    setSwipeDirection(null);
  }, [term.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      // Swipe Left -> Unknown
      setSwipeDirection('left');
      if (isKnown) onToggleKnown?.();
      setTimeout(() => onNext?.(), 200);
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Known
      setSwipeDirection('right');
      if (!isKnown) onToggleKnown?.();
      setTimeout(() => onNext?.(), 200);
    }
  };

  return (
    <div className="relative w-full max-w-md perspective-1000">
      <motion.div 
        className="w-full h-[540px] sm:h-[480px] cursor-pointer group relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ 
          x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
          opacity: swipeDirection ? 0 : 1,
          rotate: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0
        }}
        onClick={handleFlip}
      >
        {/* Swipe Indicators */}
        <AnimatePresence>
          {swipeDirection === 'left' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 z-50 bg-rose-500/20 rounded-[2.5rem] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-rose-500 text-white p-4 rounded-full shadow-xl">
                <X size={48} />
              </div>
            </motion.div>
          )}
          {swipeDirection === 'right' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 z-50 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-emerald-500 text-white p-4 rounded-full shadow-xl">
                <Check size={48} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 max-w-[70%]">
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

              <div className="flex items-center gap-1 sm:gap-2">
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
            </div>
            
            {/* Center Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 break-words font-sans leading-tight">
                {isFlipped ? term.meaning : term.term}
              </h2>
              <p className="text-sm sm:text-base opacity-60 uppercase tracking-widest font-bold mb-8">
                {isFlipped ? '뜻 (Meaning)' : '의학 용어 (Term)'}
              </p>

              {/* Middle: Pronunciation */}
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all border shadow-sm ${
                  isPlaying 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : isFlipped ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-white text-primary border-primary/20 hover:bg-primary/5'
                }`}
                title="발음 듣기"
              >
                {isPlaying ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                <span className="text-xs font-bold uppercase tracking-widest">발음 듣기</span>
              </button>
            </div>

            {/* Bottom: Study Buttons */}
            <div className="w-full mt-8 mb-6">
              <AnimatePresence mode="wait">
                {isFlipped ? (
                  <motion.div 
                    key="study-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-full flex justify-center gap-4"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isKnown) onToggleKnown?.();
                        onNext?.();
                      }}
                      className={`flex-1 max-w-[160px] flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all ${
                        !isKnown 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <X size={16} />
                      아직 몰라요
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isKnown) onToggleKnown?.();
                        onNext?.();
                      }}
                      className={`flex-1 max-w-[160px] flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all ${
                        isKnown 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <Check size={16} />
                      다 외웠어요!
                    </button>
                  </motion.div>
                ) : (
                  <div className="h-[52px] sm:h-[60px]" /> // Spacer to maintain layout
                )}
              </AnimatePresence>
            </div>

            {/* Bottommost: Hint */}
            <div className="w-full flex justify-center pb-2">
              <div className="flex items-center gap-2 text-base sm:text-lg text-slate-700 font-black uppercase tracking-widest">
                <Info size={20} className="text-primary" />
                클릭해서 뒤집어보세요
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Flashcard;
