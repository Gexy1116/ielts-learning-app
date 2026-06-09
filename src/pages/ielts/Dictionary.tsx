import { useState, useMemo, useEffect } from 'react';
import { vocabWordsExtended } from '../../data/english/vocabulary-extended';
import { db, getSavedVocabularyWords } from '../../store/db';
import { Search, Volume2, Bookmark, X, Check, Filter } from 'lucide-react';

// Derive categories from vocab data
const allWords = vocabWordsExtended;
const allTopics = Array.from(new Set(allWords.map(w => w.topic))).filter(Boolean).sort();
const categories = ['全部', ...allTopics];

// Difficulty labels
const freqLabels: Record<number, { label: string; color: string }> = {
  0: { label: '入门', color: 'bg-slate-50 text-slate-500' },
  1: { label: '初级', color: 'bg-green-50 text-green-600' },
  2: { label: '中级', color: 'bg-blue-50 text-blue-600' },
  3: { label: '进阶', color: 'bg-purple-50 text-purple-600' },
  4: { label: '高级', color: 'bg-orange-50 text-orange-600' },
  5: { label: '冲刺', color: 'bg-red-50 text-red-600' },
};

export default function IeltsDictionary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  // Load saved words from DB on mount
  useEffect(() => {
    getSavedVocabularyWords().then(words => {
      setSavedWords(new Set(words.map(w => w.word)));
    });
  }, []);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const filtered = useMemo(() => {
    let result = allWords;
    if (category !== '全部') result = result.filter(w => w.topic === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.word.toLowerCase().includes(q) || w.translation.includes(q)
      );
    }
    return result;
  }, [search, category]);

  const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">雅思必备词典</h1>
        <p className="text-slate-500 mt-1">收录雅思高频核心词汇，支持搜索和分类浏览</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索单词或中文释义..."
          className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === c ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Results count + page info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{filtered.length} 个单词</div>
        {filtered.length > PAGE_SIZE && (
          <div className="text-xs text-slate-400">显示 {paged.length} / {filtered.length}</div>
        )}
      </div>

      {/* Word list */}
      <div className="grid gap-2 md:grid-cols-2">
        {paged.map(entry => {
          const freq = freqLabels[entry.stage] || freqLabels[2];
          const isSelected = selectedId === entry.id;
          return (
          <button
            key={entry.id}
            onClick={() => setSelectedId(isSelected ? null : entry.id)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              isSelected ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{entry.word}</span>
                <span className="text-slate-400 text-xs ml-2">{entry.phonetic}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${freq.color}`}>
                  {freq.label}
                </span>
                {entry.isIeltsCore && (
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">核心</span>
                )}
                <span className="text-slate-500 text-sm">{entry.translation}</span>
              </div>
            </div>

            {isSelected && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                <div>
                  <span className="text-xs text-slate-400">{entry.partOfSpeech} · 难度 {entry.difficulty}/5</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-600 italic">"{entry.exampleSentence}"</span>
                  <br />
                  <span className="text-slate-400">{entry.exampleTranslation}</span>
                </div>
                {entry.topic && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-slate-400">分类:</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{entry.topic}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={(e) => { e.stopPropagation(); speak(entry.word); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-200">
                    <Volume2 size={14} /> 发音
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const exists = await db.vocabularyBook.get(entry.word);
                      if (!exists) {
                        await db.vocabularyBook.put({
                          id: entry.word,
                          word: entry.word,
                          translation: entry.translation,
                          addedAt: new Date().toISOString(),
                          mastered: false,
                        });
                        setSavedWords(s => new Set([...s, entry.word]));
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      savedWords.has(entry.word)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                    }`}
                  >
                    {savedWords.has(entry.word) ? <Check size={14} /> : <Bookmark size={14} />}
                    {savedWords.has(entry.word) ? '已加入' : '加入生词本'}
                  </button>
                </div>
              </div>
            )}
          </button>
        )})}
      </div>

      {/* Load more */}
      {hasMore && (
        <button onClick={() => setPage(p => p + 1)}
          className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">
          加载更多 ({filtered.length - paged.length} 个剩余)
        </button>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Filter size={32} className="mx-auto mb-2 opacity-50" />
          没有匹配的单词
        </div>
      )}
    </div>
  );
}
