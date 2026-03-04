import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react';
import { MedicalTerm, weekThemes } from '../data/terms';

interface ReviewNoteModalProps {
  terms: MedicalTerm[];
  knownTermIds: string[];
  favoriteTermIds: string[];
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

const ReviewNoteModal: React.FC<ReviewNoteModalProps> = ({ 
  terms, 
  knownTermIds, 
  favoriteTermIds, 
  onToggleFavorite, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  // Filter only unknown terms
  const unknownTerms = terms.filter(t => !knownTermIds.includes(t.id));
  
  // Group by week
  const groupedTerms: Record<string, MedicalTerm[]> = unknownTerms.reduce((acc, term) => {
    const week = term.week;
    if (!acc[week]) acc[week] = [];
    acc[week].push(term);
    return acc;
  }, {} as Record<string, MedicalTerm[]>);

  const toggleWeek = (week: string) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const filteredGroupedTerms = Object.entries(groupedTerms).reduce((acc, [week, weekTerms]) => {
    const filtered = weekTerms.filter(t => 
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[week] = filtered;
    return acc;
  }, {} as Record<string, MedicalTerm[]>);

  const sortedWeeks = Object.keys(filteredGroupedTerms).sort((a, b) => {
    if (a === '사전/사후') return -1;
    if (b === '사전/사후') return 1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-primary" />
              오답노트 만들기
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              미암기 단어 중 학습하고 싶은 단어를 선택하세요
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="단어 또는 뜻으로 검색..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedWeeks.length > 0 ? (
            sortedWeeks.map(week => (
              <div key={week} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => toggleWeek(week)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase">
                      {week === '사전/사후' ? '사전/사후' : `${week}주차`}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {weekThemes[week as any] || '의학용어'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ({filteredGroupedTerms[week].length}개)
                    </span>
                  </div>
                  {expandedWeeks[week] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <AnimatePresence>
                  {expandedWeeks[week] && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-50"
                    >
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredGroupedTerms[week].map(term => {
                          const isSelected = favoriteTermIds.includes(term.id);
                          return (
                            <button
                              key={term.id}
                              onClick={() => onToggleFavorite(term.id)}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isSelected 
                                  ? 'bg-primary/5 border-primary/30 text-primary' 
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-bold truncate">{term.term}</p>
                                <p className="text-[10px] opacity-70 truncate">{term.meaning}</p>
                              </div>
                              <div className={`shrink-0 ml-2 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-primary border-primary text-white' : 'border-slate-200'
                              }`}>
                                {isSelected && <Check size={12} strokeWidth={4} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
              <Search size={48} strokeWidth={1.5} />
              <p className="text-sm font-bold uppercase tracking-widest">검색 결과가 없거나 모든 단어를 암기하셨습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500">
            총 <span className="text-primary">{favoriteTermIds.length}</span>개의 단어가 선택됨
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            완료
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReviewNoteModal;
