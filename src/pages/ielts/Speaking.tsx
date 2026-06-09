import { useState, useRef, useEffect } from 'react';
import { ieltsSpeakingPrompts } from '../../data/ielts/speaking';
import { Eye, EyeOff, Lightbulb, Mic } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

export default function IeltsSpeaking() {
  const [selectedId, setSelectedId] = useState(ieltsSpeakingPrompts[0]?.id || '');
  const [showSample, setShowSample] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [phase, setPhase] = useState<'ready' | 'preparing' | 'speaking' | 'done'>('ready');

  const prompt = ieltsSpeakingPrompts.find(p => p.id === selectedId);
  const prepTimer = useTimer(60);
  const speakTimer = useTimer(120);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount or topic change
  useEffect(() => {
    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, [selectedId]);

  if (!prompt) return <div className="text-center py-20 text-slate-500">暂无口语话题</div>;

  const startPractice = () => {
    if (prompt.part === 2) {
      setPhase('preparing');
      prepTimer.reset();
      prepTimer.start();
      // Auto transition from prep to speaking after 60s
      phaseTimeoutRef.current = setTimeout(() => {
        prepTimer.pause();
        setPhase('speaking');
        speakTimer.reset();
        speakTimer.start();
        // Auto mark as done after 120s of speaking
        phaseTimeoutRef.current = setTimeout(() => {
          speakTimer.pause();
          setPhase('done');
        }, 120000);
      }, 60000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">雅思口语</h1>
        <p className="text-slate-500 mt-1">IELTS Speaking Part 1-3 话题练习</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ieltsSpeakingPrompts.map(p => (
          <button key={p.id} onClick={() => { setSelectedId(p.id); setShowSample(false); setPhase('ready'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedId === p.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            Part {p.part}: {p.topic}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">Part {prompt.part}</span>
          <h2 className="font-semibold text-slate-800">{prompt.topic}</h2>
          <span className="text-xs text-slate-400">{prompt.difficulty}</span>
        </div>

        {/* Timer for Part 2 */}
        {prompt.part === 2 && phase !== 'ready' && phase !== 'done' && (
          <div className={`mb-4 p-3 rounded-xl text-center ${phase === 'preparing' ? 'bg-amber-50' : 'bg-blue-50'}`}>
            <div className="text-sm text-slate-500 mb-1">
              {phase === 'preparing' ? '📝 准备时间' : '🎤 作答时间'}
            </div>
            <div className="text-2xl font-mono font-bold text-slate-700">
              {phase === 'preparing'
                ? `${String(prepTimer.minutes).padStart(2, '0')}:${String(prepTimer.seconds).padStart(2, '0')}`
                : `${String(speakTimer.minutes).padStart(2, '0')}:${String(speakTimer.seconds).padStart(2, '0')}`
              }
            </div>
          </div>
        )}

        {/* Done state for Part 2 */}
        {prompt.part === 2 && phase === 'done' && (
          <div className="mb-4 p-4 bg-green-50 rounded-xl text-center">
            <div className="text-lg font-bold text-green-600">✅ 练习完成!</div>
            <div className="text-sm text-green-500 mt-1">Part 2 模拟练习已完成，可以查看参考回答</div>
            <button onClick={() => setPhase('ready')}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
              重新练习
            </button>
          </div>
        )}

        {/* Prompt */}
        <div className="p-4 bg-slate-50 rounded-xl mb-4">
          <div className="text-slate-700 whitespace-pre-line text-sm">{prompt.prompt}</div>
          {prompt.promptCn && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 text-xs whitespace-pre-line">{prompt.promptCn}</div>
          )}
        </div>

        {/* Follow-up questions for Part 3 */}
        {prompt.followUpQuestions && prompt.followUpQuestions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-slate-500 mb-2">后续问题:</div>
            {prompt.followUpQuestions.map((q, i) => (
              <div key={i} className="text-sm text-slate-600 mb-1">• {q}</div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mb-4 flex-wrap">
          {prompt.part === 2 && phase === 'ready' && (
            <button onClick={startPractice}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Mic size={16} /> 开始模拟练习
            </button>
          )}
          <button onClick={() => setShowSample(!showSample)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            {showSample ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSample ? '隐藏参考回答' : '查看参考回答'}
          </button>
          <button onClick={() => setShowTips(!showTips)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Lightbulb size={16} /> {showTips ? '隐藏' : '查看'}技巧
          </button>
        </div>

        {showTips && (
          <div className="p-4 bg-amber-50 rounded-xl mb-4">
            <div className="font-medium text-amber-700 text-sm mb-2">💡 答题技巧</div>
            {prompt.tips.map((tip, i) => (
              <div key={i} className="text-sm text-amber-600 mb-1">• {tip}</div>
            ))}
          </div>
        )}

        {showSample && prompt.sampleAnswer && (
          <div>
            <div className="p-4 bg-green-50 rounded-xl text-sm text-slate-700 whitespace-pre-line">{prompt.sampleAnswer}</div>
            {prompt.sampleAnswerCn && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 whitespace-pre-line">{prompt.sampleAnswerCn}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
