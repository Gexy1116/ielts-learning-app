import { useState, useRef, useEffect } from 'react';
import { dictationExercises } from '../../data/english/dictations';
import { completeLesson, addStudyTime } from '../../store/db';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';

export default function Dictation() {
  const [selectedId, setSelectedId] = useState(dictationExercises[0]?.id || '');
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const exercise = dictationExercises.find(e => e.id === selectedId);

  // Track completion
  const lastIdx = (exercise?.sentences.length || 1) - 1;
  useEffect(() => {
    if (submitted && sentenceIndex === lastIdx && results.length === exercise?.sentences.length) {
      completeLesson(`dictation-${exercise?.id}`, exercise?.stage);
      addStudyTime(Math.ceil((exercise?.sentences.length || 1) / 3));
    }
  }, [submitted, sentenceIndex, results.length]);

  if (!exercise) return <div className="text-center py-20 text-slate-500">暂无明显练习</div>;

  const sentence = exercise.sentences[sentenceIndex];

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.75;
    speechSynthesis.speak(u);
  };

  const check = () => {
    const correct = userInput.trim().toLowerCase() === sentence.correctText.toLowerCase();
    setResults([...results, correct]);
    setSubmitted(true);
  };

  const next = () => {
    if (sentenceIndex < exercise.sentences.length - 1) {
      setSentenceIndex(i => i + 1);
      setUserInput('');
      setSubmitted(false);
    }
  };

  const reset = () => {
    setSentenceIndex(0);
    setUserInput('');
    setSubmitted(false);
    setResults([]);
  };

  const correctCount = results.filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">听写训练</h1>
        <p className="text-slate-500 mt-1">听英文句子，写出你听到的内容</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {dictationExercises.map(e => (
          <button key={e.id} onClick={() => { setSelectedId(e.id); reset(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === e.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}>
            {e.title}
          </button>
        ))}
      </div>

      {sentenceIndex < exercise.sentences.length ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="text-sm text-slate-400 mb-4">
              句子 {sentenceIndex + 1} / {exercise.sentences.length}
            </div>
            <button
              onClick={() => speak(sentence.audioText)}
              className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 flex items-center justify-center mx-auto transition-colors"
            >
              <Volume2 size={36} />
            </button>
            <p className="text-xs text-slate-400 mt-3">点击播放（可多次播放）</p>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !submitted) check(); if (e.key === 'Enter' && submitted) next(); }}
            placeholder="输入你听到的内容..."
            className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary-400"
            disabled={submitted}
          />

          {!submitted ? (
            <button onClick={check}
              className="mt-4 w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
              确认
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <div className={`p-4 rounded-xl ${results[results.length - 1] ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {results[results.length - 1] ? <><Check size={18} /> 正确!</> : <><X size={18} /> 有错误</>}
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-medium">正确答案：</div>
                  <div className="text-slate-600">{sentence.correctText}</div>
                  <div className="text-slate-400 text-xs mt-1">{sentence.translation}</div>
                </div>
                {!results[results.length - 1] && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">你的输入：</div>
                    <div className="text-red-600">{userInput}</div>
                  </div>
                )}
              </div>
              {sentenceIndex < exercise.sentences.length - 1 ? (
                <button onClick={next}
                  className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
                  下一句 →
                </button>
              ) : (
                <div className="p-6 bg-green-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">🎉 完成!</div>
                  <div className="text-slate-600 mt-1">正确 {correctCount}/{exercise.sentences.length}</div>
                  <button onClick={reset}
                    className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg text-sm flex items-center gap-1 mx-auto">
                    <RotateCcw size={16} /> 重新开始
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
