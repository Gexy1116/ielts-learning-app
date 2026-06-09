import { useState, useMemo } from 'react';
import { conversations } from '../../data/english/conversations';
import { Volume2, MessageCircle } from 'lucide-react';

const STAGE_LABELS = ['初级', '进阶', '雅思衔接', '雅思基础', '雅思强化', '雅思冲刺'];

export default function Conversation() {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [stageFilter, setStageFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (stageFilter === null) return conversations;
    return conversations.filter(c => c.stage === stageFilter);
  }, [stageFilter]);

  const conv = conversations.find(c => c.id === selectedId);

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">对话练习</h1>
        <p className="text-slate-500 mt-1">场景化英语对话，中英对照，点击句子听发音 · {conversations.length} 个场景</p>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setStageFilter(null); setSelectedId(filtered[0]?.id || ''); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            stageFilter === null ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
          }`}>全部 ({conversations.length})</button>
        {STAGE_LABELS.map((label, i) => {
          const count = conversations.filter(c => c.stage === i).length;
          if (count === 0) return null;
          return (
            <button key={i} onClick={() => { setStageFilter(i); setSelectedId(filtered[0]?.id || ''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                stageFilter === i ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
              }`}>{label} ({count})</button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === c.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}
            }`}
          >
            {c.scenario}
          </button>
        ))}
      </div>

      {conv && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} className="text-primary-500" />
            <h2 className="font-semibold text-slate-800">{conv.scenario}</h2>
          </div>

          <div className="space-y-3">
            {conv.dialogues.map((d, i) => (
              <div key={i} className={`flex gap-3 ${d.speaker === 'A' || d.speaker === 'Customer' || d.speaker === 'Candidate' ? '' : 'flex-row-reverse'}`}>
                <div className={`max-w-[75%] rounded-2xl p-4 ${
                  d.speaker === 'A' || d.speaker === 'Customer' || d.speaker === 'Candidate'
                    ? 'bg-primary-50 rounded-tl-none'
                    : 'bg-slate-100 rounded-tr-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-400">{d.speaker}</span>
                    <button onClick={() => speak(d.text)} className="p-1 rounded hover:bg-white/50 transition-colors">
                      <Volume2 size={14} className="text-slate-400" />
                    </button>
                  </div>
                  <p className="text-slate-800 text-sm">{d.text}</p>
                  <p className="text-slate-400 text-xs mt-1">{d.translation}</p>
                </div>
              </div>
            ))}
          </div>

          {conv.keyPhrases.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">🔑 重点短语</h3>
              <div className="flex flex-wrap gap-2">
                {conv.keyPhrases.map((kp, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm">
                    <span className="text-slate-700">{kp.phrase}</span>
                    <span className="text-slate-400 mx-1">—</span>
                    <span className="text-slate-500">{kp.translation}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
