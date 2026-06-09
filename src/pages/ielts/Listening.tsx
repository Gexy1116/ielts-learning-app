import { useState } from 'react';
import { ieltsListeningTests } from '../../data/ielts/listening';
import { Volume2, Eye, EyeOff, Check, X, Headphones } from 'lucide-react';
import type { IeltsQuestion } from '../../types/ielts';

export default function IeltsListening() {
  const [selectedId, setSelectedId] = useState(ieltsListeningTests[0]?.id || '');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const test = ieltsListeningTests.find(t => t.id === selectedId);
  if (!test) return <div className="text-center py-20 text-slate-500">暂无听力题目</div>;

  const handleSubmit = () => setSubmitted(true);
  const score = test.questions.filter(q => answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase()).length;

  const renderQuestion = (q: IeltsQuestion, i: number) => (
    <div key={q.id} className="p-4 bg-slate-50 rounded-xl">
      <p className="text-sm font-medium text-slate-700 mb-3">{i + 1}. {q.questionText}</p>
      {q.options ? (
        <div className="space-y-1.5">
          {q.options.map((opt, oi) => {
            const isSelected = answers[q.id] === opt;
            const isCorrect = opt === q.correctAnswer;
            let cls = 'border-slate-200 hover:bg-white';
            if (submitted) {
              if (isCorrect) cls = 'border-green-400 bg-green-50';
              else if (isSelected) cls = 'border-red-400 bg-red-50';
              else cls = 'border-slate-100 text-slate-400';
            } else if (isSelected) cls = 'border-primary-400 bg-primary-50';
            return (
              <button key={oi} onClick={() => { if (!submitted) setAnswers(a => ({ ...a, [q.id]: opt })); }}
                className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>
                {String.fromCharCode(65 + oi)}. {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <input type="text" value={answers[q.id] || ''}
          onChange={(e) => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
          disabled={submitted}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">雅思听力</h1>
        <p className="text-slate-500 mt-1">IELTS Listening 真题练习，Section 1-4</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ieltsListeningTests.map(t => (
          <button key={t.id} onClick={() => { setSelectedId(t.id); setAnswers({}); setSubmitted(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === t.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}>
            Section {t.section}: {t.title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Headphones size={24} className="text-primary-500" />
            <div>
              <h2 className="font-semibold text-slate-800">{test.title}</h2>
              <span className="text-xs text-slate-400">Section {test.section} · {test.difficulty}</span>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="p-3 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
            title="播放音频"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <div className="text-xs text-slate-400 mb-4">
          💡 点击播放按钮收听音频（使用Web Speech API朗读transcript模拟）
        </div>

        <div className="space-y-3 mb-6">
          {test.questions.map((q, i) => renderQuestion(q, i))}
        </div>

        {!submitted ? (
          <button onClick={handleSubmit}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
            提交答案
          </button>
        ) : (
          <div className="p-6 bg-primary-50 rounded-xl text-center">
            <div className="text-3xl font-bold text-primary-600">{score}/{test.questions.length}</div>
            <div className="text-sm text-slate-500 mt-1">正确率 {Math.round(score / test.questions.length * 100)}%</div>
          </div>
        )}

        {test.transcript && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-2">
              {showTranscript ? <><EyeOff size={16} /> 隐藏录音原文</> : <><Eye size={16} /> 查看录音原文</>}
            </button>
            {showTranscript && (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 whitespace-pre-line">
                {test.transcript}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
