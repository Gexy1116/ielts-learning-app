import { useState } from 'react';
import { ieltsWritingTasks } from '../../data/ielts/writing';
import { Clock, Eye, EyeOff, FileText } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

export default function IeltsWriting() {
  const [selectedId, setSelectedId] = useState(ieltsWritingTasks[0]?.id || '');
  const [essay, setEssay] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const task = ieltsWritingTasks.find(t => t.id === selectedId);
  if (!task) return <div className="text-center py-20 text-slate-500">暂无写作题目</div>;

  const { minutes, seconds, start, reset, isRunning } = useTimer(task.timeLimit * 60);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">雅思写作</h1>
        <p className="text-slate-500 mt-1">IELTS Writing Task 1 & 2 练习</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ieltsWritingTasks.map(t => (
          <button key={t.id} onClick={() => { setSelectedId(t.id); setEssay(''); setSubmitted(false); reset(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedId === t.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            Task {t.taskNumber}: {t.difficulty}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Task {task.taskNumber} 题目</h2>
            <span className="text-sm text-slate-400">{task.difficulty}</span>
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-line mb-4">{task.prompt}</div>
          {task.promptCn && <div className="text-sm text-slate-500 whitespace-pre-line bg-slate-50 p-3 rounded-lg">{task.promptCn}</div>}
          <div className="mt-4 flex gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><FileText size={14} /> 字数要求: {task.wordLimit}+</span>
            <span className="flex items-center gap-1"><Clock size={14} /> 时间: {task.timeLimit}分钟</span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-500 mb-1">评分标准:</div>
            <div className="flex flex-wrap gap-1">
              {task.scoringCriteria.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Writing Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-slate-800">你的作文</h2>
              <span className={`text-sm ${wordCount >= task.wordLimit ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                {wordCount} / {task.wordLimit} 词
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning && !submitted && (
                <button onClick={start} className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm">开始计时</button>
              )}
              {isRunning && (
                <span className="font-mono text-lg font-bold text-primary-600">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>

          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="在此输入你的作文..."
            className="flex-1 min-h-[300px] p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400"
            disabled={submitted}
          />

          <div className="mt-4 flex gap-2">
            {!submitted && (
              <button onClick={() => setSubmitted(true)}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
                disabled={essay.trim().length === 0}>
                提交作文
              </button>
            )}
            {submitted && task.sampleAnswer && (
              <button onClick={() => setShowSample(!showSample)}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 flex items-center justify-center gap-2">
                {showSample ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSample ? '隐藏范文' : '查看范文'}
              </button>
            )}
          </div>

          {showSample && task.sampleAnswer && (
            <div className="mt-4">
              <div className="p-4 bg-green-50 rounded-xl text-sm text-slate-700 whitespace-pre-line">{task.sampleAnswer}</div>
              {task.sampleAnswerCn && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 whitespace-pre-line">{task.sampleAnswerCn}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
