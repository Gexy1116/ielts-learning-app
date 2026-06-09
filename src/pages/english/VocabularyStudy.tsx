import { useState, useEffect } from 'react';
import { vocabWordsExtended as vocabWords } from '../../data/english/vocabulary-extended';
import { getOrCreateProgress, db } from '../../store/db';
import { Volume2, ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import type { VocabWord } from '../../types/english';

type ToastType = { message: string; type: 'success' | 'warning' | 'info' } | null;

export default function VocabularyStudy() {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastType>(null);
  const [finished, setFinished] = useState(false);

  const topics = Array.from(new Set(vocabWords.map(w => w.topic)));
  const filteredWords = selectedTopic === 'all'
    ? vocabWords
    : vocabWords.filter(w => w.topic === selectedTopic);
  const currentWord = filteredWords[currentIndex];

  // Load progress from DB on mount (known words, review list, last position)
  useEffect(() => {
    getOrCreateProgress().then(p => {
      setKnownIds(new Set(p.vocabularyKnown));
      setReviewIds(new Set(p.vocabReviewList || []));
      // Auto-jump to last saved position
      if (p.vocabPosition) {
        setSelectedTopic(p.vocabPosition.topic || 'all');
        setCurrentIndex(p.vocabPosition.index || 0);
      }
    });
  }, []);

  // Save position to DB whenever topic or index changes
  useEffect(() => {
    const save = async () => {
      const p = await getOrCreateProgress();
      p.vocabPosition = { topic: selectedTopic, index: currentIndex };
      await db.userProgress.put(p);
    };
    save();
  }, [selectedTopic, currentIndex]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const speakWord = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const advanceWord = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    } else {
      setFinished(true);
    }
  };

  const markAsKnown = async (word: VocabWord) => {
    const progress = await getOrCreateProgress();
    if (!progress.vocabularyKnown.includes(word.id)) {
      progress.vocabularyKnown.push(word.id);
      // Remove from review list if it was there
      if (progress.vocabReviewList) {
        progress.vocabReviewList = progress.vocabReviewList.filter(id => id !== word.id);
      }
      await db.userProgress.put(progress);
    }
    setKnownIds(s => new Set([...s, word.id]));
    setReviewIds(s => {
      const next = new Set(s);
      next.delete(word.id);
      return next;
    });
    setToast({ message: `✅ "${word.word}" 已标记为掌握`, type: 'success' });
    setTimeout(advanceWord, 400);
  };

  const markForReview = async (word: VocabWord) => {
    const progress = await getOrCreateProgress();
    if (!progress.vocabReviewList) {
      progress.vocabReviewList = [];
    }
    if (!progress.vocabReviewList.includes(word.id)) {
      progress.vocabReviewList.push(word.id);
      await db.userProgress.put(progress);
    }
    setReviewIds(s => new Set([...s, word.id]));
    setToast({ message: `🔄 "${word.word}" 已加入复习列表，下次再练`, type: 'warning' });
    setTimeout(advanceWord, 400);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setFinished(false);
  };

  const learnedCount = filteredWords.filter(w => knownIds.has(w.id)).length;
  const reviewCount = filteredWords.filter(w => reviewIds.has(w.id)).length;
  const totalCount = filteredWords.length;

  if (finished) {
    const pct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : '👍'}</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">本轮学习完成!</h2>
          <div className="text-lg text-slate-600 mb-2">
            已掌握 <span className="font-bold text-green-600">{learnedCount}</span> / {totalCount} 个单词
          </div>
          {reviewCount > 0 && (
            <div className="text-sm text-orange-600 mb-4">
              {reviewCount} 个单词已加入复习列表，明天会出现在每日背单词中
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={resetSession}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 flex items-center gap-2">
              <RotateCcw size={18} /> 重新学习
            </button>
            <button onClick={() => { setMode('quiz'); resetSession(); }}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 flex items-center gap-2">
              <Trophy size={18} /> 开始测试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">该分类暂无词汇数据</p>
        <button onClick={() => setSelectedTopic('all')}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">
          查看全部词汇
        </button>
      </div>
    );
  }

  const wordStatus = knownIds.has(currentWord.id)
    ? 'mastered' : reviewIds.has(currentWord.id)
    ? 'review' : 'new';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">词汇学习</h1>
        <p className="text-slate-500 mt-1">按主题学习单词，闪卡记忆+测试巩固</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-bounce ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'warning' ? 'bg-orange-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Topic Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setSelectedTopic('all'); resetSession(); }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTopic === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          全部 ({totalCount})
        </button>
        {topics.map(topic => {
          const count = vocabWords.filter(w => w.topic === topic).length;
          return (
            <button
              key={topic}
              onClick={() => { setSelectedTopic(topic); resetSession(); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === topic ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {topic} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-slate-500">已掌握 {learnedCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-slate-500">待复习 {reviewCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span className="text-slate-500">未学 {totalCount - learnedCount - reviewCount}</span>
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">{Math.round((learnedCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(learnedCount / totalCount) * 100}%` }} />
          <div className="h-full bg-orange-400 transition-all" style={{ width: `${(reviewCount / totalCount) * 100}%` }} />
        </div>
      </div>

      {/* Mode Switch */}
      <div className="flex gap-2">
        <button onClick={() => setMode('flashcard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'flashcard' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-slate-600 border hover:bg-slate-50'
          }`}>
          <BookOpen size={16} className="inline mr-1" /> 闪卡模式
        </button>
        <button onClick={() => setMode('quiz')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'quiz' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-slate-600 border hover:bg-slate-50'
          }`}>
          <Trophy size={16} className="inline mr-1" /> 选择题测试
        </button>
      </div>

      {mode === 'flashcard' ? (
        /* Flashcard */
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Word status badge */}
            <div className="text-center mb-3">
              {wordStatus === 'mastered' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Check size={12} /> 已掌握
                </span>
              )}
              {wordStatus === 'review' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <RotateCcw size={12} /> 待复习
                </span>
              )}
            </div>

            <div
              onClick={() => setFlipped(!flipped)}
              style={{ perspective: '1200px', cursor: 'pointer' }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '320px',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }}
                    className="mb-4 p-3 rounded-full hover:bg-slate-100 transition-colors active:scale-90"
                    title="听发音"
                  >
                    <Volume2 size={28} className="text-primary-500" />
                  </button>
                  <div className="text-4xl font-bold text-slate-800 mb-2">{currentWord.word}</div>
                  <div className="text-lg text-slate-400">{currentWord.phonetic}</div>
                  {currentWord.isIeltsCore && (
                    <span className="mt-3 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">雅思核心词汇</span>
                  )}
                  <div className="mt-6 text-xs text-slate-400 flex items-center gap-1">
                    👆 点击卡片翻转查看释义
                  </div>
                </div>
                {/* Back */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #93c5fd',
                  }}
                >
                  <div className="text-3xl font-bold text-primary-700 mb-2">{currentWord.translation}</div>
                  <div className="text-sm text-slate-500 mb-1 px-3 py-0.5 bg-white/60 rounded-full">{currentWord.partOfSpeech}</div>
                  <div className="text-sm text-slate-600 italic mt-4 text-center leading-relaxed max-w-xs">
                    "{currentWord.exampleSentence}"
                  </div>
                  <div className="text-xs text-slate-400 mt-2 text-center">
                    {currentWord.exampleTranslation}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false); }}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
                title="上一个"
              >
                <ArrowLeft size={22} />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => markForReview(currentWord)}
                  className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw size={16} /> 需复习
                </button>
                <button
                  onClick={() => markAsKnown(currentWord)}
                  className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Check size={16} /> 已掌握
                </button>
              </div>

              <button
                onClick={() => { setCurrentIndex(Math.min(filteredWords.length - 1, currentIndex + 1)); setFlipped(false); }}
                disabled={currentIndex === filteredWords.length - 1}
                className="p-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
                title="下一个"
              >
                <ArrowRight size={22} />
              </button>
            </div>

            {/* Position indicator */}
            <div className="flex justify-center mt-4 gap-1">
              {filteredWords.slice(0, Math.min(20, filteredWords.length)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i); setFlipped(false); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-primary-500 w-4' :
                    knownIds.has(filteredWords[i].id) ? 'bg-green-400' :
                    reviewIds.has(filteredWords[i].id) ? 'bg-orange-400' :
                    'bg-slate-300'
                  }`}
                />
              ))}
              {filteredWords.length > 20 && (
                <span className="text-xs text-slate-400 ml-1">+{filteredWords.length - 20}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <QuizMode words={filteredWords} onBack={() => setMode('flashcard')} />
      )}
    </div>
  );
}

function QuizMode({ words, onBack }: { words: VocabWord[]; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongWords, setWrongWords] = useState<VocabWord[]>([]);

  if (words.length === 0) return null;

  if (finished) {
    const pct = Math.round((score / index) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">测试完成!</h2>
        <div className="text-4xl font-bold text-primary-600 mb-2">{score}/{index}</div>
        <div className="text-slate-500 mb-4">正确率 {pct}%</div>
        {wrongWords.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 mb-4 text-left">
            <div className="text-sm font-medium text-red-700 mb-2">需要复习的单词：</div>
            {wrongWords.map(w => (
              <div key={w.id} className="text-sm text-red-600 flex justify-between">
                <span>{w.word}</span>
                <span>{w.translation}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setIndex(0); setScore(0); setWrongWords([]); setFinished(false); setSelected(null); setShowResult(false); }}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm">
            重新测试
          </button>
          <button onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm">
            返回闪卡
          </button>
        </div>
      </div>
    );
  }

  const word = words[index % words.length];
  const wrongOptions = words
    .filter(w => w.id !== word.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [...wrongOptions.map(w => w.translation), word.translation]
    .sort(() => Math.random() - 0.5);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setShowResult(true);
    if (opt === word.translation) {
      setScore(s => s + 1);
    } else {
      setWrongWords(prev => {
        if (!prev.find(w => w.id === word.id)) return [...prev, word];
        return prev;
      });
    }
  };

  const next = () => {
    setSelected(null);
    setShowResult(false);
    if (index + 1 >= words.length) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">{index + 1}/{words.length}</span>
        <span className="text-sm font-medium text-slate-600">✅ {score} 正确</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-sm text-slate-400 mb-2">选择正确的中文释义</div>
        <div className="text-3xl font-bold text-slate-800">{word.word}</div>
        <div className="text-slate-400 mt-1">{word.phonetic}</div>
      </div>

      <div className="space-y-3">
        {options.map((opt, i) => {
          let btnClass = 'bg-white border-slate-200 hover:bg-slate-50 hover:border-primary-300';
          if (showResult) {
            if (opt === word.translation) btnClass = 'bg-green-50 border-green-400 text-green-700 font-semibold';
            else if (opt === selected) btnClass = 'bg-red-50 border-red-400 text-red-700';
            else btnClass = 'bg-slate-50 border-slate-200 text-slate-400';
          }
          return (
            <button
              key={i}
              onClick={() => !showResult && handleSelect(opt)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all active:scale-[0.98] ${btnClass}`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-6 text-center animate-fadeIn">
          <div className={`text-lg font-bold mb-1 ${selected === word.translation ? 'text-green-600' : 'text-red-600'}`}>
            {selected === word.translation ? '✅ 正确!' : `❌ 错误! 正确答案: ${word.translation}`}
          </div>
          <div className="text-sm text-slate-500 mt-1 italic">"{word.exampleSentence}"</div>
          <div className="text-xs text-slate-400 mt-1">{word.exampleTranslation}</div>
          <button onClick={next}
            className="mt-4 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all">
            {index + 1 >= words.length ? '查看结果 →' : '下一题 →'}
          </button>
        </div>
      )}
    </div>
  );
}
