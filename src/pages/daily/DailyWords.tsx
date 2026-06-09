import { useEffect, useState, useRef } from 'react';
import { vocabWordsExtended as vocabWords } from '../../data/english/vocabulary-extended';
import { db, getOrCreateProgress, addStudyTime } from '../../store/db';
import { Volume2, Check, RotateCcw, Flame, ArrowRight, Settings, RefreshCw, Pencil } from 'lucide-react';
import type { VocabWord } from '../../types/english';

const REVIEW_INTERVALS = [1, 3, 7, 30];
const WORDS_OPTIONS = [5, 10, 15, 20, 25, 30];

function getTodayStr(): string { return new Date().toISOString().split('T')[0]; }
function getYesterdayStr(): string { const d = new Date(Date.now() - 86400000); return d.toISOString().split('T')[0]; }
function daysBetween(a: string, b: string): number { return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000); }

type Phase = 'study1' | 'study2' | 'spelling' | 'retest' | 'done';

export default function DailyWords() {
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState<Phase>('study1');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [wordsPerDay, setWordsPerDay] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // Spelling state
  const [spellInput, setSpellInput] = useState('');
  const [spellSubmitted, setSpellSubmitted] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [wrongWords, setWrongWords] = useState<VocabWord[]>([]);
  const [spellScore, setSpellScore] = useState({ correct: 0, total: 0 });
  const [canReplay, setCanReplay] = useState(true);
  const spellInputRef = useRef<HTMLInputElement>(null);

  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const totalWords = allWords.length;
  const word = allWords[currentIndex];

  useEffect(() => { getOrCreateProgress().then(p => { if (p.wordsPerDay) setWordsPerDay(p.wordsPerDay); }); }, []);
  useEffect(() => { initWords(); }, [wordsPerDay]);

  const changeWordsPerDay = async (n: number) => {
    setSaving(true); setWordsPerDay(n);
    const p = await getOrCreateProgress(); p.wordsPerDay = n; await db.userProgress.put(p);
    await db.dailyWords.delete(today); setSaving(false); setShowSettings(false);
  };

  const initWords = async (forceRegen = false) => {
    setLoading(true);
    const progress = await getOrCreateProgress();
    setStreak(progress.streak);

    let record = await db.dailyWords.get(today);
    if (forceRegen && record) { await db.dailyWords.delete(today); record = undefined; }
    if (!record || (record.words.length === 0 && record.reviewWords.length === 0)) {
      const known = new Set(progress.vocabularyKnown);
      let available = vocabWords.filter(w => !known.has(w.id) && w.stage <= 3);
      if (available.length < wordsPerDay) available = vocabWords.filter(w => !known.has(w.id));
      const shuffled = available.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(wordsPerDay, available.length)).map(w => w.id);

      const reviewIds = new Set<string>();
      const yesterdayRecord = await db.dailyWords.get(yesterday);
      if (yesterdayRecord) yesterdayRecord.words.forEach(wid => reviewIds.add(wid));
      const allRecords = await db.dailyWords.toArray();
      allRecords.forEach(r => {
        if (r.date === yesterday || r.date === today) return;
        r.words.forEach(wid => { if (!r.completed.includes(wid) && REVIEW_INTERVALS.includes(daysBetween(today, r.date))) reviewIds.add(wid); });
      });
      (progress.vocabReviewList || []).forEach(id => reviewIds.add(id));
      selected.forEach(id => reviewIds.delete(id));

      record = { date: today, words: selected, completed: [], reviewWords: Array.from(reviewIds) };
      await db.dailyWords.put(record);
    }

    const allIds = [...record.words, ...record.reviewWords].filter(id => !record!.completed.includes(id));
    const wordList = allIds.map(id => vocabWords.find(w => w.id === id)).filter(Boolean) as VocabWord[];
    setAllWords(wordList);
    setCurrentIndex(0); setFlipped(false); setPhase('study1');
    setWrongWords([]); setSpellScore({ correct: 0, total: 0 });
    setLoading(false);
  };

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const speakWord = () => {
    if (!word || !canReplay) return;
    setCanReplay(false);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.word);
    u.lang = 'en-US'; u.rate = 0.65;
    u.onend = () => setCanReplay(true);
    speechSynthesis.speak(u);
  };

  // ====== Flashcard handlers ======
  const advanceFlashcard = () => {
    setFlipped(false);
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Move to next phase
      if (phase === 'study1') {
        setPhase('study2'); setCurrentIndex(0);
      } else if (phase === 'study2') {
        setPhase('spelling'); setCurrentIndex(0);
        setTimeout(() => { spellInputRef.current?.focus(); speakWord(); }, 500);
      }
    }
  };

  const markMastered = async (wordId: string) => {
    const record = await db.dailyWords.get(today);
    if (record && !record.completed.includes(wordId)) {
      record.completed.push(wordId); await db.dailyWords.put(record);
      const p = await getOrCreateProgress();
      if (!p.vocabularyKnown.includes(wordId)) p.vocabularyKnown.push(wordId);
      if (p.vocabReviewList) p.vocabReviewList = p.vocabReviewList.filter(id => id !== wordId);
      await db.userProgress.put(p);
    }
    advanceFlashcard();
  };

  // ====== Spelling handlers ======
  const checkSpelling = () => {
    setSpellSubmitted(true);
    const correct = spellInput.trim().toLowerCase() === word.word.toLowerCase();
    setSpellCorrect(correct);
    const newScore = { correct: spellScore.correct + (correct ? 1 : 0), total: spellScore.total + 1 };
    setSpellScore(newScore);

    if (!correct) {
      setWrongWords(prev => { if (!prev.find(w => w.id === word.id)) return [...prev, word]; return prev; });
    }
  };

  const nextSpelling = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(i => i + 1); setSpellInput(''); setSpellSubmitted(false); setSpellCorrect(false);
      setTimeout(() => { spellInputRef.current?.focus(); speakWord(); }, 300);
    } else {
      // Finished spelling all words
      if (wrongWords.length > 0) {
        setAllWords(wrongWords); setCurrentIndex(0); setWrongWords([]);
        setSpellInput(''); setSpellSubmitted(false); setSpellCorrect(false);
        setPhase('retest');
        setTimeout(() => { spellInputRef.current?.focus(); speakWord(); }, 500);
      } else {
        // All correct!
        addStudyTime(Math.ceil(totalWords / 2));
        setPhase('done');
      }
    }
  };

  const nextRetest = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(i => i + 1); setSpellInput(''); setSpellSubmitted(false); setSpellCorrect(false);
      setTimeout(() => { spellInputRef.current?.focus(); speakWord(); }, 300);
    } else {
      if (wrongWords.length > 0) {
        setAllWords(wrongWords); setCurrentIndex(0); setWrongWords([]);
        setSpellInput(''); setSpellSubmitted(false); setSpellCorrect(false);
        setTimeout(() => { spellInputRef.current?.focus(); speakWord(); }, 500);
      } else {
        addStudyTime(Math.ceil(totalWords / 4));
        setPhase('done');
      }
    }
  };

  // Auto-speak on phase change to spelling/retest
  useEffect(() => {
    if ((phase === 'spelling' || phase === 'retest') && word && !loading) {
      setTimeout(speakWord, 600);
    }
  }, [phase, currentIndex]);

  if (loading || saving) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  if (phase === 'done') {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">今日任务全部完成!</h2>
        <div className="text-slate-600 mb-2">
          已通过 <span className="font-bold text-green-600">闪光卡学习×2</span> + <span className="font-bold text-blue-600">拼写测试</span>
        </div>
        <div className="text-lg text-slate-500 mb-1">拼写成绩: {spellScore.correct}/{spellScore.total}</div>
        <div className="flex items-center justify-center gap-2 text-orange-500 mb-4"><Flame size={24} /><span className="text-2xl font-bold">{streak}</span><span className="text-slate-400">天连续打卡</span></div>
        <button onClick={() => initWords(true)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm flex items-center gap-1 mx-auto hover:bg-slate-200"><RefreshCw size={14} /> 重新生成</button>
        <p className="text-xs text-slate-400 mt-4">明天会自动复习今天学过的单词!</p>
      </div>
    );
  }

  if (!word) {
    return <div className="text-center py-20"><p className="text-slate-500">没有单词了</p><button onClick={() => initWords(true)} className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">刷新</button></div>;
  }

  // ====== SPELLING VIEW ======
  if (phase === 'spelling' || phase === 'retest') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {phase === 'retest' ? '🔁 错词重测' : '✍️ 拼写测试'}
            </h1>
            <p className="text-slate-500 mt-1">听发音，拼写单词</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-slate-100"><Settings size={22} className="text-slate-500" /></button>
        </div>

        {/* Phase tracker */}
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600">✅ 学习①</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600">✅ 学习②</span>
          <span className={`px-3 py-1 rounded-full font-bold ${phase === 'spelling' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
            {phase === 'retest' ? '🔁 重测' : '✍️ 拼写'}
          </span>
        </div>

        {/* Score */}
        <div className="bg-white rounded-xl p-3 shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-2"><Pencil size={18} className="text-blue-500" /><span className="font-medium">{spellScore.correct}/{spellScore.total} 正确</span></div>
          <span className="text-sm text-slate-400">{currentIndex + 1}/{totalWords}</span>
          {wrongWords.length > 0 && <span className="text-sm text-red-500">(本轮已错 {wrongWords.length})</span>}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <button onClick={speakWord} disabled={!canReplay}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
              canReplay ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95' : 'bg-slate-100 text-slate-300'}`}>
            <Volume2 size={40} />
          </button>

          {spellSubmitted && (
            <div className={`mb-4 text-sm font-medium ${spellCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {spellCorrect ? '✅ 正确!' : '❌ 拼写错误!'}
            </div>
          )}

          <input ref={spellInputRef} type="text" value={spellInput}
            onChange={e => setSpellInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !spellSubmitted) checkSpelling(); if (e.key === 'Enter' && spellSubmitted) (phase === 'retest' ? nextRetest : nextSpelling)(); }}
            placeholder="输入单词拼写..."
            className={`w-full p-4 border-2 rounded-xl text-xl text-center font-medium focus:outline-none transition-colors ${
              spellSubmitted ? (spellCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-slate-200 focus:border-blue-400'}`}
            disabled={spellSubmitted} autoComplete="off" spellCheck={false} />

          {spellSubmitted && (
            <div className="mt-4">
              <div className="text-lg font-semibold text-slate-800">{word.word}</div>
              <div className="text-slate-400 text-sm">{word.phonetic}</div>
              <div className="text-slate-500 text-sm mt-1">{word.translation}</div>
              {!spellCorrect && <div className="mt-2 text-sm"><span className="text-slate-400">你的输入: </span><span className="text-red-500">{spellInput}</span></div>}
            </div>
          )}

          <div className="mt-6">
            {!spellSubmitted ? (
              <button onClick={checkSpelling} className="px-8 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600">确认拼写</button>
            ) : (
              <button onClick={phase === 'retest' ? nextRetest : nextSpelling}
                className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
                {currentIndex < totalWords - 1 ? '下一词 →' : wrongWords.length > 0 ? `重测 ${wrongWords.length} 个错词 →` : '完成!'}
              </button>
            )}
          </div>
          {!spellSubmitted && <button onClick={speakWord} disabled={!canReplay} className="mt-3 text-sm text-slate-400 hover:text-blue-500">再听一遍</button>}
        </div>
      </div>
    );
  }

  // ====== FLASHCARD VIEW (study1 / study2) ======
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">每日背单词</h1>
          <p className="text-slate-500 mt-1">每天{wordsPerDay}个新词 · 闪卡学习×2 → 拼写测试</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-slate-100"><Settings size={22} className="text-slate-500" /></button>
      </div>

      {showSettings && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-sm font-medium text-slate-700 mb-3">每日新词数量</div>
          <div className="flex gap-2 flex-wrap">
            {WORDS_OPTIONS.map(n => (
              <button key={n} onClick={() => changeWordsPerDay(n)} className={`px-4 py-2 rounded-lg text-sm font-medium ${wordsPerDay === n ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>{n} 词/天</button>
            ))}
          </div>
        </div>
      )}

      {/* Phase tracker */}
      <div className="flex gap-2 text-xs">
        <span className={`px-3 py-1 rounded-full font-bold ${phase === 'study1' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
          {phase === 'study1' ? '📖 学习①' : '✅ 学习①'}
        </span>
        <span className={`px-3 py-1 rounded-full ${(phase as string) === 'study2' ? 'bg-green-500 text-white font-bold' : (phase as string) !== 'study1' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
          {(phase as string) === 'study2' ? '📖 学习②' : (phase as string) !== 'study1' ? '✅ 学习②' : '⏳ 学习②'}
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400">⏳ 拼写测试</span>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">
            {phase === 'study1' ? '第一遍学习' : '第二遍学习'}
          </span>
          <span className="text-sm text-slate-400">{currentIndex + 1}/{totalWords}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full">
          <div className={`h-2 rounded-full transition-all ${phase === 'study1' ? 'bg-green-400' : 'bg-green-600'}`}
            style={{ width: `${totalWords > 0 ? ((currentIndex + (phase === 'study2' ? totalWords : 0)) / (totalWords * 2)) * 100 : 0}%` }} />
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-orange-500"><Flame size={14} /> {streak} 天</div>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-3">
            <span className="text-sm text-slate-400">{currentIndex + 1} / {totalWords}</span>
            <span className="text-xs text-slate-400 ml-2">{phase === 'study1' ? '第一遍' : '第二遍'}</span>
          </div>

          <div onClick={() => setFlipped(!flipped)} style={{ perspective: '1200px', cursor: 'pointer' }}>
            <div style={{ position: 'relative', height: '320px', transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <button onClick={(e) => { e.stopPropagation(); speak(word.word); }} className="mb-6 p-3 rounded-full hover:bg-slate-100 transition-colors"><Volume2 size={28} className="text-primary-500" /></button>
                <div className="text-4xl font-bold text-slate-800 mb-3">{word.word}</div>
                <div className="text-lg text-slate-400">{word.phonetic}</div>
                <div className="mt-6 text-xs text-slate-400">点击翻转查看释义</div>
              </div>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#eff6ff', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #93c5fd' }}>
                <div className="text-3xl font-bold text-primary-700 mb-3">{word.translation}</div>
                <div className="text-sm text-slate-500 mb-2">{word.partOfSpeech}</div>
                <div className="text-sm text-slate-600 italic mt-4 text-center leading-relaxed">{word.exampleSentence}</div>
                <div className="text-xs text-slate-400 mt-2 text-center">{word.exampleTranslation}</div>
                {word.isIeltsCore && <span className="mt-3 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">雅思核心</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button onClick={advanceFlashcard}
              className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 flex items-center gap-2">
              <RotateCcw size={18} /> 稍后复习
            </button>
            <button onClick={() => markMastered(word.id)}
              className="px-5 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 flex items-center gap-2">
              <Check size={18} /> 已掌握
            </button>
            <button onClick={advanceFlashcard}
              className="px-5 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 flex items-center gap-2">
              下一词 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
