import { useEffect, useState } from 'react';
import { getOrCreateProgress } from '../store/db';
import { Clock, BookOpen, Target, TrendingUp, Trophy, Flame } from 'lucide-react';
import type { UserProgress } from '../types/ielts';

export default function Stats() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    getOrCreateProgress().then(setProgress);
  }, []);

  const totalLessons = Object.keys(progress?.completedLessons || {}).length;
  const totalTests = Object.keys(progress?.testScores || {}).length;
  const studyHours = Math.floor((progress?.totalStudyMinutes || 0) / 60);
  const avgScore = totalTests > 0
    ? Math.round(Object.values(progress?.testScores || {}).reduce((a, b) => a + b, 0) / totalTests)
    : 0;

  const stageData = [
    { name: '初级英语', done: progress?.completedStages?.[0] || 0, total: 15, color: '#22c55e' },
    { name: '进阶英语', done: progress?.completedStages?.[1] || 0, total: 15, color: '#3b82f6' },
    { name: '雅思衔接', done: progress?.completedStages?.[2] || 0, total: 12, color: '#8b5cf6' },
    { name: '雅思基础', done: progress?.completedStages?.[3] || 0, total: 12, color: '#f59e0b' },
    { name: '雅思强化', done: progress?.completedStages?.[4] || 0, total: 12, color: '#ef4444' },
    { name: '雅思冲刺', done: progress?.completedStages?.[5] || 0, total: 10, color: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">学习统计</h1>
        <p className="text-slate-500 mt-1">追踪你的学习进展和成果</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <Flame size={24} className="text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{progress?.streak || 0}</div>
          <div className="text-sm text-slate-500">连续打卡</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <Clock size={24} className="text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{studyHours}h</div>
          <div className="text-sm text-slate-500">学习时长</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <BookOpen size={24} className="text-green-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{totalLessons}</div>
          <div className="text-sm text-slate-500">完成课程</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <Trophy size={24} className="text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{totalTests > 0 ? `${avgScore}%` : '--'}</div>
          <div className="text-sm text-slate-500">平均成绩</div>
        </div>
      </div>

      {/* Stage progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary-500" /> 阶段进度
        </h2>
        <div className="space-y-3">
          {stageData.map(stage => {
            const pct = Math.min(100, Math.round((stage.done / stage.total) * 100));
            return (
              <div key={stage.name} className="flex items-center gap-3">
                <div className="w-20 text-sm text-slate-600 shrink-0">{stage.name}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                </div>
                <div className="text-sm text-slate-400 w-16 text-right">{stage.done}/{stage.total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary & Score trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-green-500" /> 词汇量估算
          </h2>
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-green-600">
              ~{(progress?.vocabularyKnown?.length || 0) * 5}
            </div>
            <div className="text-slate-400 mt-2 text-sm">
              已掌握 {progress?.vocabularyKnown?.length || 0} 个主动词汇
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-500" /> 成绩趋势
          </h2>
          {totalTests > 0 ? (
            <div className="space-y-2">
              {Object.entries(progress?.testScores || {}).slice(0, 5).map(([id, score]) => (
                <div key={id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">{id.slice(0, 10)}...</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">暂无测试数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
