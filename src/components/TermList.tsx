import React from 'react';
import { Search, ChevronRight, BookOpen, Heart } from 'lucide-react';
import { MedicalTerm, initialTerms } from '../data/terms';

interface TermListProps {
  terms: MedicalTerm[];
  onSelect: (index: number) => void;
  currentIndex: number;
  favoriteTermIds: string[];
  onToggleFavorite: (id: string) => void;
}

const TermList: React.FC<TermListProps> = ({ terms, onSelect, currentIndex, favoriteTermIds, onToggleFavorite }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  const displayTerms = showAll ? initialTerms : terms;

  const filteredTerms = displayTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
              {showAll ? '전체 단어장' : '현재 목록'}
            </h3>
          </div>
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${
              showAll ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {showAll ? '목록으로' : '전체보기'}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="단어 또는 뜻 검색..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term) => {
            const originalIndex = terms.findIndex(t => t.id === term.id);
            const isActive = originalIndex !== -1 && originalIndex === currentIndex;
            const isFavorite = favoriteTermIds.includes(term.id);
            
            return (
              <button
                key={term.id}
                onClick={() => originalIndex !== -1 && onSelect(originalIndex)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-all hover:bg-primary/5 group ${
                  isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-slate-900'}`}>
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
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(term.id);
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      isFavorite
                        ? 'bg-rose-50 text-rose-500'
                        : 'text-slate-300 hover:text-rose-400 hover:bg-rose-50/50'
                    }`}
                  >
                    <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform group-hover:translate-x-1 ${
                      isActive ? 'text-primary' : 'text-slate-300'
                    }`} 
                  />
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400 italic">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermList;
