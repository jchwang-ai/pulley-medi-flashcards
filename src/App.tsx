import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  HeartPulse,
  Stethoscope,
  Activity,
  ClipboardList,
  Heart,
  BarChart3,
  BookOpen,
  PlusCircle
} from 'lucide-react';
import Flashcard from './components/Flashcard';
import ProgressBar from './components/ProgressBar';
import TermList from './components/TermList';
import WeeklyView from './components/WeeklyView';
import Dashboard from './components/Dashboard';
import ReviewNoteModal from './components/ReviewNoteModal';
import { initialTerms, MedicalTerm, UserProgress, weekThemes } from './data/terms';

export default function App() {
  const [terms, setTerms] = useState<MedicalTerm[]>(initialTerms);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'weekly' | 'review' | 'dashboard' | 'study'>('weekly');
  const [reviewFilter, setReviewFilter] = useState<'unknown' | 'favorites'>('unknown');
  const [filteredWeek, setFilteredWeek] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  
  // Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('mediterm_progress');
    return saved ? JSON.parse(saved) : { knownTermIds: [], favoriteTermIds: [] };
  });

  useEffect(() => {
    localStorage.setItem('mediterm_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, terms]);

  const toggleKnown = (id: string) => {
    setProgress(prev => ({
      ...prev,
      knownTermIds: prev.knownTermIds.includes(id)
        ? prev.knownTermIds.filter(tid => tid !== id)
        : [...prev.knownTermIds, id]
    }));
  };

  const toggleFavorite = (id: string) => {
    setProgress(prev => ({
      ...prev,
      favoriteTermIds: prev.favoriteTermIds.includes(id)
        ? prev.favoriteTermIds.filter(tid => tid !== id)
        : [...prev.favoriteTermIds, id]
    }));
  };

  const currentTerm = terms[currentIndex];
  const favoriteTerms = terms.filter(t => progress.favoriteTermIds.includes(t.id));
  const unknownTerms = terms.filter(t => !progress.knownTermIds.includes(t.id));
  
  const displayTerms = viewMode === 'review' 
    ? (reviewFilter === 'unknown' ? unknownTerms : favoriteTerms)
    : (filteredWeek !== null ? terms.filter(t => t.week === filteredWeek) : terms);
  
  const currentDisplayTerm = displayTerms.length > 0 
    ? displayTerms[currentIndex % displayTerms.length]
    : terms[0];

  const handleNext = () => {
    if (filteredWeek !== null) {
      setCurrentIndex((prev) => (prev + 1) % displayTerms.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % terms.length);
    }
  };

  const handlePrev = () => {
    if (filteredWeek !== null) {
      setCurrentIndex((prev) => (prev - 1 + displayTerms.length) % displayTerms.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + terms.length) % terms.length);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...terms].sort(() => Math.random() - 0.5);
    setTerms(shuffled);
    setCurrentIndex(0);
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <HeartPulse className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tighter leading-none uppercase">PULLEY-MEDI</h1>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                의학용어 단어장
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => {
                setViewMode('weekly');
                setFilteredWeek(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'weekly' || (viewMode === 'study' && filteredWeek !== null) ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              학습하기
            </button>
            <button 
              onClick={() => {
                setViewMode('review');
                setReviewFilter('unknown');
                setCurrentIndex(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'review' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              오답노트
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'dashboard' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              학습 리포트
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Settings button removed */}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex items-center justify-around shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => {
            setViewMode('weekly');
            setFilteredWeek(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            viewMode === 'weekly' || (viewMode === 'study' && filteredWeek !== null) ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <Activity size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">학습</span>
        </button>
        <button 
          onClick={() => {
            setViewMode('review');
            setReviewFilter('unknown');
            setCurrentIndex(0);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            viewMode === 'review' ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">오답</span>
        </button>
        <button 
          onClick={() => setViewMode('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            viewMode === 'dashboard' ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">리포트</span>
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 md:py-12 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {viewMode === 'weekly' ? (
            <motion.div 
              key="weekly-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <WeeklyView 
                terms={terms} 
                onSelectWeek={(week) => {
                  setFilteredWeek(week);
                  setCurrentIndex(0);
                  setViewMode('study');
                }}
                onSelectTerm={(id) => {
                  const idx = terms.findIndex(t => t.id === id);
                  setFilteredWeek(null);
                  setCurrentIndex(idx);
                  setViewMode('study');
                }}
              />
            </motion.div>
          ) : viewMode === 'study' || viewMode === 'review' ? (
            <motion.div 
              key="study-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-12"
            >
              {/* Back Button & Title */}
              <div className="w-full flex items-center justify-between">
                <button 
                  onClick={() => setViewMode('weekly')}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all group"
                >
                  <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:border-primary/20 group-hover:bg-primary/5">
                    <ChevronLeft size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">뒤로가기</span>
                </button>

                <div className="flex items-center gap-4">
                  {viewMode === 'review' && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button 
                        onClick={() => {
                          setReviewFilter('unknown');
                          setCurrentIndex(0);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          reviewFilter === 'unknown' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        미암기 단어
                      </button>
                      <button 
                        onClick={() => {
                          setReviewFilter('favorites');
                          setCurrentIndex(0);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          reviewFilter === 'favorites' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        즐겨찾기
                      </button>
                    </div>
                  )}
                  {viewMode === 'review' && (
                    <button 
                      onClick={() => setIsCreatingNote(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <PlusCircle size={16} />
                      오답노트 만들기
                    </button>
                  )}
                </div>
              </div>

              {/* Flashcard & List Section */}
              <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8 md:gap-12">
                <div className="flex-1 w-full flex flex-col items-center gap-8 md:gap-12">
                  {/* Progress Section */}
                  <div className="w-full flex flex-col items-center gap-8">
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <ProgressBar current={currentIndex + 1} total={displayTerms.length} />
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {filteredWeek !== null && (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                              {filteredWeek}주차
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {weekThemes[filteredWeek] || '의학용어'}
                            </span>
                          </div>
                        )}
                        {viewMode === 'review' && reviewFilter === 'favorites' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            나만의 단어장
                          </div>
                        )}
                        {viewMode === 'review' && reviewFilter === 'unknown' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            미암기 단어
                          </div>
                        )}
                        <button 
                          onClick={handleShuffle}
                          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                        >
                          <RotateCcw size={12} />
                          섞기
                        </button>
                        <div className="hidden sm:block h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <ClipboardList size={14} />
                          {displayTerms.length}개
                        </div>
                        <button 
                          onClick={() => setShowList(!showList)}
                          className={`lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            showList ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-500'
                          }`}
                        >
                          <BookOpen size={12} />
                          목록
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flashcard Section */}
                  <div className="w-full relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
                    <div className="w-full max-w-md order-1 sm:order-2">
                      {displayTerms.length > 0 ? (
                        <Flashcard 
                          key={currentDisplayTerm.id}
                          term={currentDisplayTerm} 
                          isKnown={progress.knownTermIds.includes(currentDisplayTerm.id)}
                          isFavorite={progress.favoriteTermIds.includes(currentDisplayTerm.id)}
                          onToggleKnown={() => toggleKnown(currentDisplayTerm.id)}
                          onToggleFavorite={() => toggleFavorite(currentDisplayTerm.id)}
                        />
                      ) : (
                        <div className="w-full aspect-[3/2] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400">
                          <Heart size={48} />
                          <p className="text-sm font-bold uppercase tracking-widest">
                            {viewMode === 'review' && reviewFilter === 'unknown' ? '모든 단어를 암기하셨습니다! ✨' : '나만의 단어장이 비어있습니다'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-8 sm:gap-0 sm:contents order-2 sm:order-1">
                      <button 
                        onClick={handlePrev}
                        className="sm:absolute sm:left-[-20px] md:left-[-40px] p-3 sm:p-4 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 shadow-sm transition-all active:scale-95 z-10"
                      >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                      </button>
                      
                      <button 
                        onClick={handleNext}
                        className="sm:absolute sm:right-[-20px] md:right-[-40px] p-3 sm:p-4 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 shadow-sm transition-all active:scale-95 z-10"
                      >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="flex items-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">SPACE</span>
                      카드 뒤집기
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">← / →</span>
                      이동하기
                    </div>
                  </div>
                </div>

                {/* Term List Sidebar - Only in Review Mode or Study Mode */}
                <div className={`w-full lg:w-80 shrink-0 ${showList ? 'block' : 'hidden lg:block'}`}>
                  <TermList 
                    terms={displayTerms} 
                    currentIndex={currentIndex % displayTerms.length}
                    onSelect={(id) => {
                      const displayIdx = displayTerms.findIndex(t => t.id === id);
                      if (displayIdx !== -1) {
                        setCurrentIndex(displayIdx);
                      } else {
                        // If not in current displayTerms, reset filters to show all terms
                        const allIdx = terms.findIndex(t => t.id === id);
                        setFilteredWeek(null);
                        setViewMode('study');
                        setCurrentIndex(allIdx);
                      }
                      if (window.innerWidth < 1024) setShowList(false);
                    }}
                    favoriteTermIds={progress.favoriteTermIds}
                    onToggleFavorite={toggleFavorite}
                  />
                  <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    {viewMode === 'review' ? (reviewFilter === 'favorites' ? '나만의 단어장 목록' : '미암기 단어 목록') : '현재 학습 목록'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-full flex items-center justify-start">
                <button 
                  onClick={() => setViewMode('weekly')}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all group"
                >
                  <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:border-primary/20 group-hover:bg-primary/5">
                    <ChevronLeft size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">뒤로가기</span>
                </button>
              </div>
              <Dashboard terms={terms} progress={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingNote && (
            <ReviewNoteModal 
              terms={terms}
              knownTermIds={progress.knownTermIds}
              favoriteTermIds={progress.favoriteTermIds}
              onToggleFavorite={toggleFavorite}
              onClose={() => setIsCreatingNote(false)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal removed */}

      {/* Footer Stats */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-end">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Activity className="text-primary" size={14} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">세션 활성화됨</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Stethoscope className="text-primary" size={14} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">안산대학교 커리큘럼</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
