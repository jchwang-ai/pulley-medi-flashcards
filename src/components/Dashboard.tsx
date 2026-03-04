import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Heart, 
  Users, 
  TrendingUp,
  BookOpen,
  Calendar
} from 'lucide-react';
import { MedicalTerm, UserProgress } from '../data/terms';

interface DashboardProps {
  terms: MedicalTerm[];
  progress: UserProgress;
}

const Dashboard: React.FC<DashboardProps> = ({ terms, progress }) => {
  const totalTerms = terms.length;
  const knownCount = progress.knownTermIds.length;
  const favoriteCount = progress.favoriteTermIds.length;
  const unknownCount = totalTerms - knownCount;
  const progressPercent = Math.round((knownCount / totalTerms) * 100);

  // Group by week
  const termsByWeek = terms.reduce((acc, term) => {
    const week = term.week || 0;
    if (!acc[week]) acc[week] = { total: 0, known: 0 };
    acc[week].total++;
    if (progress.knownTermIds.includes(term.id)) acc[week].known++;
    return acc;
  }, {} as Record<number, { total: number, known: number }>);

  const weeks = Object.keys(termsByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900">
            나의 학습 현황
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            의학용어 마스터를 위한 나의 진도를 확인하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20">
          <TrendingUp size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {progressPercent}% 달성
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<BookOpen className="text-primary" />} 
          label="전체 단어" 
          value={totalTerms} 
          subValue="커리큘럼 포함"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          label="아는 단어" 
          value={knownCount} 
          subValue={`${progressPercent}% 완료`}
          color="emerald"
        />
        <StatCard 
          icon={<XCircle className="text-rose-500" />} 
          label="모르는 단어" 
          value={unknownCount} 
          subValue="복습 필요"
          color="rose"
        />
        <StatCard 
          icon={<Heart className="text-rose-500" />} 
          label="즐겨찾기" 
          value={favoriteCount} 
          subValue="오답 노트"
          color="rose"
        />
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <BarChart3 className="text-primary" size={20} />
          <h3 className="text-sm font-black tracking-tighter uppercase">주차별 상세 현황</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {weeks.map((week) => {
              const weekData = termsByWeek[week];
              const weekPercent = Math.round((weekData.known / weekData.total) * 100);
              
              return (
                <div key={week} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{week}주차</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {weekData.known} / {weekData.total} 단어
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${weekPercent === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                      {weekPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weekPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${weekPercent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue: string;
  color?: 'primary' | 'emerald' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/5 border-primary/10',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose: 'bg-rose-50 border-rose-100',
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm ${colorClasses[color]} flex flex-col gap-4`}>
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{subValue}</p>
      </div>
    </div>
  );
};

export default Dashboard;
