import { useState } from 'react';
import { ieltsReadingPassages } from '../../data/ielts/reading';
import { Eye, EyeOff, Check, X, Clock } from 'lucide-react';
import type { IeltsQuestion } from '../../types/ielts';

export default function IeltsReading() {
  const [selectedId, setSelectedId] = useState(ieltsReadingPassages[0]?.id || '');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const passage = ieltsReadingPassages.find(p => p.id === selectedId);
  if (!passage) return <div className="text-center py-20 text-slate-500">暂无阅读文章</div>;

  const handleSubmit = () => setSubmitted(true);
  const score = passage.questions.filter(q => answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase()).length;

  const renderQuestion = (q: IeltsQuestion, i: number) => {
    if (q.type === 'true-false-ng') q.options = ['TRUE', 'FALSE', 'NOT GIVEN'];
    return (
      <div key={q.id} className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700 mb-2">{i + 1}. {q.questionText}</p>
        {q.options && (
          <div className="space-y-1">
            {q.options.map((opt, oi) => {
              const sel = answers[q.id] === opt; const corr = opt === q.correctAnswer;
              let cls = 'border-slate-200 hover:bg-white';
              if (submitted) { if (corr) cls = 'border-green-400 bg-green-50'; else if (sel) cls = 'border-red-400 bg-red-50'; else cls = 'border-slate-100 text-slate-400'; }
              else if (sel) cls = 'border-primary-400 bg-primary-50';
              return (
                <button key={oi} onClick={() => { if (!submitted) setAnswers(a => ({ ...a, [q.id]: opt })); }}
                  className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
        {!q.options && (
          <input type="text" value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} disabled={submitted}
            className={`w-full p-2.5 border rounded-lg text-sm ${submitted ? (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase() ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-slate-200'} focus:outline-none focus:border-primary-400`}
            placeholder="输入答案..." />
        )}
        {submitted && (
          <div className={`mt-2 p-2 rounded text-xs ${answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase() ? <Check size={12} className="inline" /> : <X size={12} className="inline" />}
            {' '}{q.explanationCn}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">雅思阅读</h1>
        <p className="text-slate-500 mt-1">IELTS Reading 真题练习，模拟机考分屏模式</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {ieltsReadingPassages.map(p => (
          <button key={p.id} onClick={() => { setSelectedId(p.id); setAnswers({}); setSubmitted(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedId === p.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            {p.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passage */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">{passage.title}</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-slate-400"><Clock size={14} /> {passage.timeLimit}分钟</span>
              <button onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
                {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{passage.passage}</div>
          {showTranslation && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-sm leading-relaxed text-slate-500 whitespace-pre-line">{passage.passageCn}</div>
          )}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">题目 ({passage.questions.length}题)</h2>
          <div className="space-y-3">{passage.questions.map((q, i) => renderQuestion(q, i))}</div>
          {!submitted ? (
            <button onClick={handleSubmit} className="mt-6 w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">提交答案</button>
          ) : (
            <div className="mt-6 p-6 bg-primary-50 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary-600">{score}/{passage.questions.length}</div>
              <div className="text-sm text-slate-500 mt-1">正确率 {Math.round(score / passage.questions.length * 100)}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
