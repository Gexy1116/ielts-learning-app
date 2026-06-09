import { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { Clock, AlertTriangle } from 'lucide-react';

const TEST_TIME = 30 * 60; // 30 min for demo

export default function TestMode() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const { minutes, seconds, start, remaining, isRunning } = useTimer(TEST_TIME);

  // Auto-submit when time runs out
  useEffect(() => {
    if (started && !isRunning && remaining === 0) {
      setFinished(true);
    }
  }, [remaining, isRunning, started]);

  const handleStart = () => {
    setStarted(true);
    start();
  };

  const handleSubmit = () => {
    setFinished(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">全真模拟考试</h1>
        <p className="text-slate-500 mt-1">模拟真实雅思机考环境，计时答题、答题卡导航</p>
      </div>

      {!started ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-6">🖥️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">雅思模拟考试</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">听力</span>
                <span className="text-sm text-slate-400">40题 · 30分钟</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">阅读</span>
                <span className="text-sm text-slate-400">40题 · 60分钟</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">写作</span>
                <span className="text-sm text-slate-400">2题 · 60分钟</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-amber-600 text-sm mb-6">
              <AlertTriangle size={16} />
              开始后计时器将启动，请确保有足够的完整时间
            </div>
            <button onClick={handleStart}
              className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 active:scale-95 transition-all">
              开始考试
            </button>
          </div>
        </div>
      ) : finished ? (
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">考试完成!</h2>
          <p className="text-slate-500 mb-6">你的答案已提交，正在生成成绩报告...</p>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-left space-y-3">
            <div className="flex justify-between"><span className="text-slate-500">听力</span><span className="font-medium text-slate-700">-- / 40</span></div>
            <div className="flex justify-between"><span className="text-slate-500">阅读</span><span className="font-medium text-slate-700">-- / 40</span></div>
            <div className="flex justify-between"><span className="text-slate-500">写作</span><span className="font-medium text-slate-700">待评分</span></div>
          </div>
          <button className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium">
            查看详细报告
          </button>
        </div>
      ) : (
        <div>
          {/* Timer Bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex items-center justify-between -mx-6 px-6">
            <span className="font-medium text-slate-700">听力 Section 1</span>
            <div className="flex items-center gap-4">
              <span className={`font-mono text-xl font-bold ${remaining < 300 ? 'text-red-600 animate-pulse' : 'text-primary-600'}`}>
                <Clock size={18} className="inline mr-1" />
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <button onClick={handleSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                提交试卷
              </button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">答题卡</h3>
            <div className="grid grid-cols-10 gap-2 mb-6">
              {Array.from({ length: 40 }, (_, i) => (
                <button key={i}
                  className={`w-9 h-9 rounded-lg text-xs font-medium border transition-colors ${
                    i < 5 ? 'bg-primary-500 text-white border-primary-500' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary-500 rounded"></div> 已答</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div> 未答</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div> 标记</div>
            </div>
          </div>

          <div className="mt-4 p-6 bg-slate-50 rounded-xl text-center text-slate-400 text-sm">
            模拟考试环境 — 题目内容与对应题型页面一致
          </div>
        </div>
      )}
    </div>
  );
}
