import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrCreateProgress, checkInToday, db } from '../store/db';
import { vocabWordsExtended } from '../data/english/vocabulary-extended';
import {
  Flame, Clock, BookOpen, TrendingUp, ArrowRight,
  CheckCircle2, Target, Trophy, Sparkles, Calendar
} from 'lucide-react';
import type { UserProgress } from '../types/ielts';

const TOTAL_VOCAB = vocabWordsExtended.length;

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [todayMastered, setTodayMastered] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await getOrCreateProgress();
    setProgress(p);
    // Count today's mastered words from dailyWords record
    const today = new Date().toISOString().split('T')[0];
    const record = await db.dailyWords.get(today);
    setTodayMastered(record?.completed?.length || 0);
  };

  const handleCheckIn = async () => {
    await checkInToday();
    setCheckedIn(true);
    await loadData();
  };

  const todayCheckIn = progress?.checkInDates?.includes(new Date().toISOString().split('T')[0]);

  // Vocab stats
  const masteredTotal = progress?.vocabularyKnown?.length || 0;
  const masteredPct = TOTAL_VOCAB > 0 ? Math.round((masteredTotal / TOTAL_VOCAB) * 100) : 0;
  const remaining = TOTAL_VOCAB - masteredTotal;
  // Estimate days: based on wordsPerDay setting, plus review
  const wordsPerDay = progress?.wordsPerDay || 10;
  const estDays = wordsPerDay > 0 ? Math.ceil(remaining / wordsPerDay) : 0;

  const quickLinks = [
    { to: '/daily/words', label: '今日背单词', icon: BookOpen, color: 'bg-blue-500' },
    { to: '/daily/spelling', label: '拼写练习', icon: Target, color: 'bg-green-500' },
    { to: '/learn/grammar', label: '语法课程', icon: BookOpen, color: 'bg-purple-500' },
    { to: '/learn/reading', label: '分级阅读', icon: BookOpen, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">欢迎回来 👋</h1>
          <p className="text-slate-500 mt-1">继续你的英语学习之旅</p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={todayCheckIn || checkedIn}
          className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
            todayCheckIn || checkedIn
              ? 'bg-green-500 cursor-default'
              : 'bg-primary-500 hover:bg-primary-600 active:scale-95'
          }`}
        >
          {todayCheckIn || checkedIn ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={20} /> 已打卡
            </span>
          ) : (
            '今日打卡'
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <Flame size={24} className="text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{progress?.streak || 0}</div>
          <div className="text-sm text-slate-500">连续打卡天数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <Clock size={24} className="text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {Math.floor((progress?.totalStudyMinutes || 0) / 60)}h
          </div>
          <div className="text-sm text-slate-500">总学习时长</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <BookOpen size={24} className="text-green-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {Object.keys(progress?.completedLessons || {}).length}
          </div>
          <div className="text-sm text-slate-500">已完成课程</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <TrendingUp size={24} className="text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">
            {Object.keys(progress?.testScores || {}).length}
          </div>
          <div className="text-sm text-slate-500">完成测试</div>
        </div>
      </div>

      {/* ===== Vocabulary Progress ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-slate-800">词汇学习进度</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Today's mastered */}
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-xs text-green-600 font-medium mb-1">今日掌握</div>
            <div className="text-3xl font-bold text-green-700">{todayMastered}</div>
            <div className="text-xs text-green-500 mt-1">个单词</div>
          </div>

          {/* Total mastered */}
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 font-medium mb-1">累计掌握</div>
            <div className="text-3xl font-bold text-blue-700">{masteredTotal.toLocaleString()}</div>
            <div className="text-xs text-blue-500 mt-1">/ {TOTAL_VOCAB.toLocaleString()} 词 ({masteredPct}%)</div>
          </div>

          {/* Estimated days */}
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-xs text-amber-600 font-medium mb-1">
              <Calendar size={12} className="inline mr-1" />
              预计完成天数
            </div>
            <div className="text-3xl font-bold text-amber-700">
              {remaining <= 0 ? '🎉' : estDays}
            </div>
            <div className="text-xs text-amber-500 mt-1">
              {remaining <= 0 ? '全部完成!' : `剩余 ${remaining.toLocaleString()} 词 · 每天${wordsPerDay}词`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>总进度</span>
            <span>{masteredPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, masteredPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span>{Math.round(TOTAL_VOCAB / 2).toLocaleString()}</span>
            <span>{TOTAL_VOCAB.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">快速开始</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-300 transition-all group"
            >
              <div className={`${link.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <link.icon size={20} className="text-white" />
              </div>
              <div className="font-medium text-slate-800 group-hover:text-primary-600 transition-colors">
                {link.label}
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-400 mt-2 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-yellow-500" />
          <h2 className="text-lg font-semibold text-slate-800">学习进度</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {['初级英语', '进阶英语', '雅思衔接', '雅思基础', '雅思强化', '雅思冲刺'].map((stage, i) => {
            const done = progress?.completedStages?.[i] || 0;
            const total = 10;
            const pct = Math.min(100, Math.round((done / total) * 100));
            return (
              <div key={i} className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke={pct > 0 ? '#3b82f6' : '#e2e8f0'} strokeWidth="6"
                      strokeDasharray={`${pct * 1.76} 176`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                    {pct}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">{stage}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
