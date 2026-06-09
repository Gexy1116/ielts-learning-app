import { useState } from 'react';
import { gradedReadings } from '../../data/english/readings';
import { completeLesson, addStudyTime } from '../../store/db';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function Reading() {
  const [selectedId, setSelectedId] = useState<string>(gradedReadings[0]?.id || '');
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const passage = gradedReadings.find(r => r.id === selectedId);
  if (!passage) return <div className="text-center py-20 text-slate-500">暂无阅读材料</div>;

  const handleSubmit = () => {
    setSubmitted(true);
    if (passage) {
      completeLesson(`reading-${passage.id}`, passage.stage);
      addStudyTime(10);
    }
  };
  const score = passage.questions.filter(q => answers[q.id] === q.correctAnswer).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">分级阅读</h1>
        <p className="text-slate-500 mt-1">难度递进阅读训练，中英对照+阅读理解题</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {gradedReadings.map(r => (
          <button key={r.id} onClick={() => { setSelectedId(r.id); setAnswers({}); setSubmitted(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === r.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}>
            Level {r.level}: {r.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passage */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">{passage.title}</h2>
            <button onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
              {showTranslation ? <><EyeOff size={16} /> 隐藏翻译</> : <><Eye size={16} /> 显示翻译</>}
            </button>
          </div>
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {passage.content}
          </div>
          {showTranslation && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-sm leading-relaxed text-slate-500 whitespace-pre-line">
              {passage.contentCn}
            </div>
          )}
          {passage.vocabHighlights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-400 mb-2">📌 重点词汇</div>
              <div className="flex flex-wrap gap-2">
                {passage.vocabHighlights.map((v, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 rounded text-xs">
                    <span className="font-medium text-slate-700">{v.word}</span>
                    <span className="text-slate-400 ml-1">{v.translation}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">阅读理解 ({passage.questions.length}题)</h2>
          <div className="space-y-6">
            {passage.questions.map((q, qi) => (
              <div key={q.id}>
                <p className="text-sm font-medium text-slate-700 mb-2">{qi + 1}. {q.question}</p>
                <div className="space-y-1">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[q.id] === opt;
                    const isCorrect = opt === q.correctAnswer;
                    let cls = 'border-slate-200 hover:bg-slate-50';
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
                {submitted && (
                  <div className={`mt-2 p-2 rounded text-xs ${answers[q.id] === q.correctAnswer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {answers[q.id] === q.correctAnswer ? <Check size={14} className="inline" /> : <X size={14} className="inline" />}
                    {' '}{q.explanationCn}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!submitted && (
            <button onClick={handleSubmit}
              className="mt-6 w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
              提交答案
            </button>
          )}
          {submitted && (
            <div className="mt-6 p-4 bg-primary-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-primary-600">{score}/{passage.questions.length}</div>
              <div className="text-sm text-slate-500">
                {score === passage.questions.length ? '🎉 全部正确!' : score >= passage.questions.length / 2 ? '👍 继续加油!' : '💪 需要更多练习'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
