import { useState, useEffect, useRef } from 'react';
import { vocabWordsExtended as vocabWords } from '../../data/english/vocabulary-extended';
import { saveSpellingResult, addStudyTime } from '../../store/db';
import { Volume2, RotateCcw, TrendingUp } from 'lucide-react';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Spelling() {
  const [words, setWords] = useState(vocabWords.slice(0, 20));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [canPlay, setCanPlay] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    filterWords(difficulty);
  }, [difficulty]);

  const filterWords = (diff: string) => {
    let filtered: typeof vocabWords;
    if (diff === 'easy') filtered = vocabWords.filter(w => w.difficulty <= 2);
    else if (diff === 'medium') filtered = vocabWords.filter(w => w.difficulty <= 3);
    else filtered = vocabWords;

    setWords(shuffle(filtered).slice(0, 15));
    reset();
  };

  const word = words[currentIndex];

  const speak = () => {
    if (!word || !canPlay) return;
    setCanPlay(false);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.word);
    u.lang = 'en-US';
    u.rate = 0.7;
    u.onend = () => setCanPlay(true);
    speechSynthesis.speak(u);
  };

  const check = () => {
    const correct = userInput.trim().toLowerCase() === word.word.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    saveSpellingResult(word.id, correct);
  };

  const next = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
      setUserInput('');
      setSubmitted(false);
      setIsCorrect(false);
      setTimeout(() => { inputRef.current?.focus(); speak(); }, 300);
    } else {
      setFinished(true);
      addStudyTime(Math.ceil(words.length / 4));
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setUserInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  };

  // Auto-speak on first load
  useEffect(() => {
    if (word && currentIndex === 0 && score.total === 0) {
      setTimeout(speak, 500);
    }
  }, [word]);

  if (finished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">拼写练习完成!</h2>
        <div className="text-5xl font-bold text-primary-600 mb-2">{score.correct}/{score.total}</div>
        <div className="text-slate-500 mb-6">正确率 {pct}%</div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium flex items-center gap-2">
            <RotateCcw size={18} /> 重新练习
          </button>
          <button onClick={() => filterWords(difficulty)}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">
              换一批词
            </button>
        </div>
      </div>
    );
  }

  if (!word) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">单词拼写练习</h1>
        <p className="text-slate-500 mt-1">听发音 → 拼写单词 → 即时纠错</p>
      </div>

      {/* Difficulty */}
      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as const).map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              difficulty === d ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}>
            {d === 'easy' ? '🌟 简单' : d === 'medium' ? '📚 中等' : '🔥 困难'}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-500" />
          <span className="font-medium text-slate-700">{score.correct}/{score.total} 正确</span>
        </div>
        <span className="text-sm text-slate-400">{currentIndex + 1}/{words.length}</span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <button
          onClick={speak}
          disabled={!canPlay}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
            canPlay ? 'bg-primary-100 text-primary-600 hover:bg-primary-200 active:scale-95' : 'bg-slate-100 text-slate-300'
          }`}
        >
          <Volume2 size={40} />
        </button>

        {submitted && (
          <div className={`mb-4 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✅ 正确!' : '❌ 错误!'}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !submitted) check(); if (e.key === 'Enter' && submitted) next(); }}
          placeholder="输入单词拼写..."
          className={`w-full p-4 border-2 rounded-xl text-xl text-center font-medium focus:outline-none transition-colors ${
            submitted
              ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
              : 'border-slate-200 focus:border-primary-400'
          }`}
          disabled={submitted}
          autoComplete="off"
          spellCheck={false}
        />

        {submitted && (
          <div className="mt-4">
            <div className="text-lg font-semibold text-slate-800">{word.word}</div>
            <div className="text-slate-400 text-sm">{word.phonetic}</div>
            <div className="text-slate-500 text-sm mt-1">{word.translation}</div>
            {!isCorrect && (
              <div className="mt-2 text-sm">
                <span className="text-slate-400">你的输入: </span>
                <span className="text-red-500">{userInput}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          {!submitted ? (
            <button onClick={check}
              className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
              确认拼写
            </button>
          ) : (
            <button onClick={next}
              className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
              {currentIndex < words.length - 1 ? '下一词 →' : '查看结果'}
            </button>
          )}
        </div>

        {!submitted && (
          <button onClick={speak} disabled={!canPlay}
            className="mt-3 text-sm text-slate-400 hover:text-primary-500">
            再听一遍
          </button>
        )}
      </div>
    </div>
  );
}
