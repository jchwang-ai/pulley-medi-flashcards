import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import { MedicalTerm, weekThemes } from '../data/terms';

interface WeeklyViewProps {
  terms: MedicalTerm[];
  onSelectWeek: (week: number) => void;
  onSelectTerm: (termId: string) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ terms, onSelectWeek, onSelectTerm }) => {
  // Group terms by week
  const groupedTerms = terms.reduce((acc, term) => {
    const week = term.week || 0;
    if (!acc[week]) acc[week] = { terms: [] };
    acc[week].terms.push(term);
    return acc;
  }, {} as Record<number, { terms: MedicalTerm[] }>);

  const weeks = Object.keys(groupedTerms)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {weeks.map((week) => (
        <motion.div
          key={week}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col hover:border-primary/30 transition-all group"
        >
          {/* Week Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Calendar className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tighter uppercase">{week === 0 ? '기타' : `${week}주차`}</h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                  {weekThemes[week] || '의학용어'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {groupedTerms[week].terms.length}개의 단어
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onSelectWeek(week)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <PlayCircle size={14} />
              학습하기
            </button>
          </div>

          {/* Term List for this week */}
          <div className="flex-1 max-h-48 overflow-y-auto divide-y divide-slate-50">
            {groupedTerms[week].terms.map((term) => (
              <button
                key={term.id}
                onClick={() => onSelectTerm(term.id)}
                className="w-full text-left p-4 flex items-center gap-4 transition-all hover:bg-primary/5 group/item"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-900 truncate group-hover/item:text-primary transition-colors">
                      {term.term}
                    </span>
                    {term.category && (
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {term.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{term.meaning}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-center">
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <BookOpen size={12} />
              커리큘럼 섹션
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WeeklyView;
