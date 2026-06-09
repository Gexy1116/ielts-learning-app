import { useState } from 'react';
import { ieltsExamBooks } from '../../data/ielts/past-papers';
import { BookOpen, Headphones, FileText, PenLine, Mic, Clock, ChevronRight, ArrowLeft, Check, X, Lightbulb } from 'lucide-react';
import { ClickableText } from '../../components/common/TranslationPopover';
import { saveTestScore, addStudyTime } from '../../store/db';
import type { IeltsExamTest, IeltsExamSection, ExamQuestion } from '../../types/ielts';
import { useTimer } from '../../hooks/useTimer';

export default function PastPapers() {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<IeltsExamTest | null>(null);
  const [activeSection, setActiveSection] = useState<'listening' | 'reading' | 'writing' | 'speaking' | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({});

  const book = selectedBook !== null ? ieltsExamBooks.find(b => b.bookNumber === selectedBook) : null;

  const handleStartSection = (section: 'listening' | 'reading' | 'writing' | 'speaking') => {
    setActiveSection(section);
    setAnswers({});
    setSubmitted(false);
  };

  const sectionData: IeltsExamSection | undefined = selectedTest && activeSection
    ? selectedTest.sections[activeSection]
    : undefined;

  const totalQuestions = sectionData?.questions?.length || 0;
  const timer = useTimer(sectionData?.timeLimit ? sectionData.timeLimit * 60 : 0);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!sectionData || !selectedTest || !activeSection) return;
    const correct = sectionData.questions.filter(
      q => (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
    ).length;
    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    setSectionScores(prev => ({ ...prev, [activeSection]: score }));
    // Save to DB
    const testId = `exam-${selectedTest.id}-${activeSection}`;
    saveTestScore(testId, score);
    addStudyTime(Math.ceil(sectionData.timeLimit / 6));
  };

  const handleBack = () => {
    if (activeSection) { setActiveSection(null); setSubmitted(false); }
    else if (selectedTest) setSelectedTest(null);
    else if (selectedBook !== null) setSelectedBook(null);
  };

  // Book selection view
  if (selectedBook === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">雅思模拟真题卷</h1>
          <p className="text-slate-500 mt-1">按剑桥雅思真题格式编写的高质量模拟题（剑雅 1-20），自由选择试卷和科目</p>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ 说明：本板块题目按照剑桥雅思真题的题型、难度和话题格式编写，是<span className="font-semibold">高质量模拟题</span>，非剑桥官方出版物原题。剑桥雅思真题受版权保护，如需官方原题请购买正版剑桥雅思书籍。
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {ieltsExamBooks.map(b => (
            <button key={b.bookNumber} onClick={() => setSelectedBook(b.bookNumber)}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all text-left group">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-primary-500 group-hover:text-primary-600" />
                <span className="font-bold text-slate-800">剑雅 {b.bookNumber}</span>
              </div>
              <div className="text-xs text-slate-500">{b.tests.length} 套试卷</div>
              <div className="text-xs text-slate-400 mt-1">听力 · 阅读 · 写作</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Test selection view
  if (!selectedTest) {
    return (
      <div className="space-y-6">
        <button onClick={handleBack} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> 返回选择真题册
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">剑雅 {selectedBook} - 选择试卷</h1>
          <p className="text-slate-500 mt-1">每册包含4套完整试卷，选择一套开始练习</p>
        </div>
        <div className="grid gap-4">
          {book?.tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Test {test.testNumber}</h3>
                <button onClick={() => setSelectedTest(test)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 flex items-center gap-1">
                  选择此卷 <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs text-slate-500">
                {(['listening','reading','writing','speaking'] as const).map(s => {
                  const sec = test.sections[s];
                  const icons = { listening: Headphones, reading: FileText, writing: PenLine, speaking: Mic };
                  const Icon = icons[s];
                  const labels = { listening:'听力', reading:'阅读', writing:'写作', speaking:'口语' };
                  const times = { listening:'30m', reading:'60m', writing:'60m', speaking:'15m' };
                  return (
                    <div key={s} className={`text-center p-3 rounded-lg ${sec ? 'bg-slate-50' : 'bg-slate-50/30 opacity-40'}`}>
                      <Icon size={16} className="mx-auto mb-1 text-slate-400" />
                      <div className="font-medium">{labels[s]}</div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Clock size={10} />{times[s]}
                      </div>
                      <div className="mt-0.5">{sec?.questions?.length || 0} 题</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Section test-taking view
  if (activeSection && sectionData) {
    if (!timer.isRunning && sectionData.timeLimit > 0) timer.start();
    const { minutes, seconds } = timer;

    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-slate-50 -mx-6 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft size={14} /> 返回
          </button>
          <div className="font-medium text-slate-700">
            剑雅{selectedTest.bookNumber} Test {selectedTest.testNumber} · {sectionData.title}
          </div>
          <span className={`font-mono font-bold ${sectionData.timeLimit * 60 - (minutes * 60 + seconds) < 300 ? 'text-red-600' : 'text-primary-600'}`}>
            {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
          <div className="font-medium mb-1">{sectionData.instructions}</div>
          <div className="text-xs text-slate-400">{sectionData.instructionsCn}</div>
        </div>

        {sectionData.passages && (
          <div className="space-y-4">
            {sectionData.passages.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-2">{p.title}</h3>
                <ClickableText>
                  <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed cursor-pointer select-text">
                    {p.content}
                  </div>
                </ClickableText>
                {p.contentCn && <div className="text-xs text-slate-400 mt-2 pt-2 border-t">{p.contentCn}</div>}
                <div className="text-xs text-slate-400 mt-2">💡 点击文中单词查看释义</div>
              </div>
            ))}
          </div>
        )}

        {sectionData.writingPrompt && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-700 whitespace-pre-line mb-3">{sectionData.writingPrompt}</div>
            <div className="text-xs text-slate-400">{sectionData.writingPromptCn}</div>
            <textarea className="mt-4 w-full h-64 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400"
              placeholder="在此输入你的作文..." />
          </div>
        )}

        {sectionData.questions.length > 0 && (
          <div className="space-y-3">
            {sectionData.questions.map((q, i) => (
              <QuestionItem key={q.id} q={q} index={i} answer={answers[q.id] || ''}
                setAnswer={(a) => setAnswers(prev => ({...prev, [q.id]: a}))}
                submitted={submitted} />
            ))}
          </div>
        )}

        {sectionData.questions.length > 0 && !submitted && (
          <button onClick={handleSubmit}
            className="w-full py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600">
            提交答案
          </button>
        )}

        {submitted && (
          <div className="space-y-4">
            <div className={`rounded-xl p-6 text-center ${(sectionScores[activeSection] || 0) >= 60 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className={`text-4xl font-bold ${(sectionScores[activeSection] || 0) >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                {sectionScores[activeSection] || 0}%
              </div>
              <div className="text-sm text-slate-500 mt-1">
                正确 {sectionData!.questions.filter(q => (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()).length} / {totalQuestions} 题
              </div>
              <div className="text-xs text-slate-400 mt-2">以下是每道题的详细解析，包含正确答案和解题思路</div>
            </div>

            {/* Full review of all questions */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" /> 逐题解析
              </h3>
              <div className="space-y-3">
                {sectionData!.questions.map((q, i) => {
                  const userAns = (answers[q.id] || '').toLowerCase().trim();
                  const correctAns = q.correctAnswer.toLowerCase().trim();
                  const isQCorrect = userAns === correctAns;
                  return (
                    <div key={q.id} className={`rounded-xl border p-4 ${isQCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isQCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{q.questionText}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isQCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isQCorrect ? '✅ 正确' : '❌ 错误'}
                        </span>
                      </div>
                      <div className="ml-8 space-y-1 text-sm">
                        <div>
                          <span className="text-slate-400">正确答案：</span>
                          <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                        </div>
                        {!isQCorrect && userAns && (
                          <div>
                            <span className="text-slate-400">你的答案：</span>
                            <span className="text-red-500">{userAns}</span>
                          </div>
                        )}
                        {!isQCorrect && !userAns && (
                          <div className="text-red-400 text-xs">未作答</div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          <Lightbulb size={10} className="inline text-amber-500 mr-1" />
                          {q.explanationCn || '建议回到原文相关段落，仔细对比选项与原文的表述差异。'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => { setActiveSection(null); setSubmitted(false); setAnswers({}); }}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600">
              返回试卷选择
            </button>
          </div>
        )}
      </div>
    );
  }

  // Section selection view
  return (
    <div className="space-y-6">
      <button onClick={handleBack} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
        <ArrowLeft size={16} /> 返回选择试卷
      </button>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">剑雅 {selectedTest.bookNumber} Test {selectedTest.testNumber}</h1>
        <p className="text-slate-500 mt-1">选择一个科目开始答题</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([
          { key: 'listening' as const, icon: Headphones, label: '听力', time: '30分钟', color: 'bg-blue-500' },
          { key: 'reading' as const, icon: FileText, label: '阅读', time: '60分钟', color: 'bg-green-500' },
          { key: 'writing' as const, icon: PenLine, label: '写作', time: '60分钟', color: 'bg-purple-500' },
          { key: 'speaking' as const, icon: Mic, label: '口语', time: '15分钟', color: 'bg-orange-500' },
        ] as const).map(({ key, icon: Icon, label, time, color }) => {
          const sec = selectedTest.sections[key];
          const score = sectionScores[key];
          return (
            <button key={key} onClick={() => sec && handleStartSection(key)}
              disabled={!sec}
              className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-left transition-all ${
                sec ? 'hover:border-primary-300 hover:shadow-md' : 'opacity-40'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-lg">{label}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={14} /> {time} · {sec?.questions?.length || 0} 题
                  </div>
                </div>
                {score !== undefined && (
                  <div className={`text-lg font-bold ${score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                    {score}%
                  </div>
                )}
                {sec && <ChevronRight size={20} className="text-slate-300" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Individual question component
function QuestionItem({ q, index, answer, setAnswer, submitted }: {
  q: ExamQuestion; index: number; answer: string; setAnswer: (a: string) => void; submitted: boolean;
}) {
  const isCorrect = answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-sm font-medium text-slate-400 shrink-0 mt-0.5">Q{index + 1}.</span>
        <ClickableText>
          <span className="text-sm text-slate-700 cursor-pointer select-text">{q.questionText}</span>
        </ClickableText>
        {q.type === 'fill-blank' && <span className="text-xs text-slate-400">（填空题）</span>}
        {q.type === 'true-false-ng' && <span className="text-xs text-slate-400">（判断题）</span>}
      </div>

      {q.options ? (
        <div className="space-y-1.5 ml-6">
          {q.options.map((opt: string, oi: number) => {
            let cls = 'border-slate-200 hover:bg-slate-50 text-slate-600';
            if (submitted) {
              if (opt === q.correctAnswer) cls = 'border-green-400 bg-green-50 text-green-700 font-medium';
              else if (opt === answer) cls = 'border-red-400 bg-red-50 text-red-700';
              else cls = 'border-slate-100 text-slate-400';
            } else if (opt === answer) cls = 'border-primary-400 bg-primary-50 text-primary-700';
            return (
              <button key={oi} onClick={() => !submitted && setAnswer(opt)}
                disabled={submitted}
                className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>
                {String.fromCharCode(65 + oi)}. {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
          disabled={submitted}
          className={`ml-6 p-2.5 border rounded-lg text-sm w-full max-w-xs ${submitted ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-slate-200'} focus:outline-none`}
          placeholder="输入答案..." />
      )}

      {submitted && (
        <div className={`mt-3 ml-6 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-1.5 font-semibold mb-1">
            {isCorrect
              ? <><Check size={16} className="text-green-600" /><span className="text-green-700">回答正确</span></>
              : <><X size={16} className="text-red-600" /><span className="text-red-700">正确答案：{q.correctAnswer}</span></>
            }
          </div>
          <div className="flex items-start gap-1.5 text-xs">
            <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5" />
            <span className="text-slate-600">{q.explanationCn || '本题考察对文章细节的理解，建议回读相关段落加深理解。'}</span>
          </div>
          {!isCorrect && answer && (
            <div className="mt-1 text-xs text-red-500">你的答案：{answer}</div>
          )}
        </div>
      )}
    </div>
  );
}
