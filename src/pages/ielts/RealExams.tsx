import { useState } from 'react';
import { realExams } from '../../data/ielts/real-exams';
import { ieltsExamBooks } from '../../data/ielts/past-papers';
import { BookOpen, Headphones, FileText, PenLine, Clock, ChevronRight, ArrowLeft, Check, X, Lightbulb, Play, Grid3X3 } from 'lucide-react';
import { ClickableText } from '../../components/common/TranslationPopover';
import { saveTestScore, addStudyTime } from '../../store/db';
import { useTimer } from '../../hooks/useTimer';

// Try real exams first, fall back to simulation data
const allBooks = realExams.length > 0 ? realExams : ieltsExamBooks;

export default function RealExams() {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'listening'|'reading'|'writing'|null>(null);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sectionScores, setSectionScores] = useState<Record<string,number>>({});

  const book = selectedBook !== null ? allBooks.find(b => b.bookNumber === selectedBook) : null;
  const test = selectedTestId && book ? book.tests.find(t => t.id === selectedTestId) : null;
  const section = test && activeSection ? test.sections[activeSection] : null;

  const timer = useTimer(section?.timeLimit ? section.timeLimit * 60 : 0);

  const handleStartSection = (sect: 'listening'|'reading'|'writing') => {
    setActiveSection(sect);
    setAnswers({});
    setSubmitted(false);
  };

  // Jump to specific question
  const jumpToQuestion = (num: number) => {
    const el = document.getElementById(`question-${num}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = () => {
    if (!section || !test || !activeSection) return;
    setSubmitted(true);
    const correct = section.questions.filter(
      q => (answers[q.id]||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
    ).length;
    const total = section.questions.length || 1;
    const score = Math.round((correct / total) * 100);
    setSectionScores(s => ({...s, [activeSection]: score}));
    saveTestScore(`real-${test.id}-${activeSection}`, score);
    addStudyTime(Math.ceil((section.timeLimit||30) / 6));
  };

  const handleBack = () => {
    if (activeSection) { setActiveSection(null); setSubmitted(false); }
    else if (selectedTestId) setSelectedTestId(null);
    else if (selectedBook !== null) setSelectedBook(null);
  };

  // Book selection
  if (selectedBook === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">雅思真题卷</h1>
          <p className="text-slate-500 mt-1">剑桥雅思真题（剑雅4-18），答案已录入，题目和解析逐步完善中</p>
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            ✅ 本板块题目来源于剑桥雅思官方出版物（需拥有正版书籍），仅供个人学习使用。
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allBooks.map(b => (
            <button key={b.bookNumber} onClick={() => setSelectedBook(b.bookNumber)}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-green-300 hover:shadow-md transition-all text-left group">
              <BookOpen size={20} className="text-green-600 mb-2" />
              <div className="font-bold text-slate-800">剑雅 {b.bookNumber}</div>
              <div className="text-xs text-slate-500">{b.tests.length} 套真题</div>
              <div className="text-xs text-slate-400 mt-1">听力🎧 · 阅读📖 · 写作✍️</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Test selection
  if (!test) {
    return (
      <div className="space-y-6">
        <button onClick={handleBack} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> 返回选择真题册
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">剑雅 {selectedBook} 真题</h1>
          <p className="text-slate-500 mt-1">选择一套真题开始练习</p>
        </div>
        <div className="grid gap-4">
          {book?.tests.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Test {t.testNumber}</h3>
                <button onClick={() => setSelectedTestId(t.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1">
                  开始做题 <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-slate-500">
                {(['listening','reading','writing'] as const).map(s => {
                  const sec = t.sections[s];
                  const icons = { listening:Headphones,reading:FileText,writing:PenLine };
                  const Icon = icons[s];
                  const labels = { listening:'听力',reading:'阅读',writing:'写作' };
                  const times = { listening:'30m',reading:'60m',writing:'60m' };
                  const score = sectionScores[`real-${t.id}-${s}`];
                  return (
                    <div key={s} className="text-center p-3 rounded-lg bg-slate-50">
                      <Icon size={16} className="mx-auto mb-1 text-slate-400"/>
                      <div className="font-medium">{labels[s]}</div>
                      <div className="flex items-center justify-center gap-1 mt-0.5"><Clock size={10}/>{times[s]}</div>
                      <div>{sec?.questions?.length || 0} 题</div>
                      {score !== undefined && <div className={`mt-1 font-bold ${score>=60?'text-green-600':'text-red-500'}`}>{score}%</div>}
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

  // Section test view
  if (activeSection && section) {
    if (!timer.isRunning && section.timeLimit > 0) timer.start();
    const { minutes, seconds } = timer;

    return (
      <div className="space-y-6">
        {/* Timer bar */}
        <div className="sticky top-0 z-10 bg-slate-50 -mx-6 px-6 py-3 border-b flex items-center justify-between">
          <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft size={14}/> 返回
          </button>
          <div className="font-medium">剑雅{test.bookNumber} T{test.testNumber} · {section.title}</div>
          <div className="flex items-center gap-3">
            {activeSection === 'listening' && (
              <button className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200" title="播放/暂停音频">
                <Play size={18}/>
              </button>
            )}
            <span className={`font-mono font-bold ${timer.remaining < 300 ? 'text-red-600' : 'text-green-600'}`}>
              {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 rounded-xl p-4 text-sm">
          <div className="font-medium text-slate-700">{section.instructions}</div>
          <div className="text-xs text-slate-400 mt-1">{section.instructionsCn}</div>
        </div>

        {/* Audio player placeholder for listening */}
        {activeSection === 'listening' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Headphones size={20} className="text-green-600"/>
              <span className="text-sm font-medium text-green-700">听力音频</span>
              <span className="text-xs text-green-500">/audio/c{test.bookNumber}/</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(section => (
                <button key={section} onClick={() => {
                  const audio = new Audio(`/audio/c${test.bookNumber}/test${test.testNumber}_section${section}.mp3`);
                  audio.play().catch(() => {});
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm hover:bg-green-100">
                  <Play size={14} className="text-green-600"/> Section {section}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reading: 2-column layout (passage left, questions right) like real IELTS computer test */}
        {activeSection === 'reading' && section.passages && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Passage column */}
            <div className="space-y-4 xl:sticky xl:top-16 xl:self-start xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
              {section.passages.map(p => (
                <div key={p.id} className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 sticky top-0 bg-white pb-2 border-b">{p.title}</h3>
                  <ClickableText>
                    <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed cursor-pointer select-text">{p.content}</div>
                  </ClickableText>
                  <div className="text-xs text-slate-400 mt-2">💡 点击文中单词查看释义</div>
                </div>
              ))}
            </div>
            {/* Questions column */}
            <div className="space-y-3" id="questions-column">
              {section.questions.map((q,i) => {
                const isCorrect = (answers[q.id]||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                return (
                  <div key={q.id} id={`question-${i+1}`} className="bg-white rounded-xl border p-4 scroll-mt-20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${answers[q.id] ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400 border'}`}>{i+1}</span>
                      <ClickableText><span className="text-sm text-slate-700 cursor-pointer select-text">{q.questionText}</span></ClickableText>
                    </div>
                    {q.options ? (
                      <div className="space-y-1.5 ml-8">
                        {q.options.map((opt:string,oi:number) => {
                          let cls = 'border-slate-200 hover:bg-slate-50';
                          if (submitted) {
                            if (opt === q.correctAnswer) cls = 'border-green-400 bg-green-50 text-green-700 font-medium';
                            else if (opt === answers[q.id]) cls = 'border-red-400 bg-red-50 text-red-700';
                            else cls = 'border-slate-100 text-slate-400';
                          } else if (opt === answers[q.id]) cls = 'border-green-400 bg-green-50';
                          return (<button key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[q.id]:opt}))} disabled={submitted} className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>{String.fromCharCode(65+oi)}. {opt}</button>);
                        })}
                      </div>
                    ) : (
                      <input type="text" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} disabled={submitted}
                        className={`ml-8 p-2.5 border rounded-lg text-sm w-full max-w-xs ${submitted?(isCorrect?'border-green-400 bg-green-50':'border-red-400 bg-red-50'):'border-slate-200'} focus:outline-none`} placeholder="输入答案..."/>
                    )}
                    {submitted && (
                      <div className={`mt-2 ml-8 p-2 rounded-lg text-sm ${isCorrect?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-1.5 font-semibold mb-1">{isCorrect?<><Check size={16} className="text-green-600"/><span className="text-green-700">正确</span></>:<><X size={16} className="text-red-600"/><span className="text-red-700">正确答案: {q.correctAnswer}</span></>}</div>
                        <div className="flex items-start gap-1 text-xs"><Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5"/><span className="text-slate-600">{q.explanationCn}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Non-reading: single column questions */}
        {activeSection !== 'reading' && section.questions.length > 0 && (
          <div className="space-y-3">
            {section.questions.map((q,i) => {
              const isCorrect = (answers[q.id]||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
              return (
                <div key={q.id} id={`question-${i+1}`} className="bg-white rounded-xl border p-4 scroll-mt-20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${answers[q.id] ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400 border'}`}>{i+1}</span>
                    <ClickableText><span className="text-sm text-slate-700 cursor-pointer select-text">{q.questionText}</span></ClickableText>
                  </div>
                  {q.options ? (
                    <div className="space-y-1.5 ml-8">
                      {q.options.map((opt:string,oi:number) => {
                        let cls = 'border-slate-200 hover:bg-slate-50';
                        if (submitted) {
                          if (opt === q.correctAnswer) cls = 'border-green-400 bg-green-50 text-green-700 font-medium';
                          else if (opt === answers[q.id]) cls = 'border-red-400 bg-red-50 text-red-700';
                          else cls = 'border-slate-100 text-slate-400';
                        } else if (opt === answers[q.id]) cls = 'border-green-400 bg-green-50';
                        return (<button key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[q.id]:opt}))} disabled={submitted} className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>{String.fromCharCode(65+oi)}. {opt}</button>);
                      })}
                    </div>
                  ) : (
                    <input type="text" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} disabled={submitted}
                      className={`ml-8 p-2.5 border rounded-lg text-sm w-full max-w-xs ${submitted?(isCorrect?'border-green-400 bg-green-50':'border-red-400 bg-red-50'):'border-slate-200'} focus:outline-none`} placeholder="输入答案..."/>
                  )}
                  {submitted && (
                    <div className={`mt-2 ml-8 p-2 rounded-lg text-sm ${isCorrect?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-1.5 font-semibold mb-1">{isCorrect?<><Check size={16} className="text-green-600"/><span className="text-green-700">正确</span></>:<><X size={16} className="text-red-600"/><span className="text-red-700">正确答案: {q.correctAnswer}</span></>}</div>
                      <div className="flex items-start gap-1 text-xs"><Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5"/><span className="text-slate-600">{q.explanationCn}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom question navigator (like real IELTS computer test) */}
        {section.questions.length > 0 && (
          <div className="sticky bottom-0 z-10 bg-white border-t shadow-lg -mx-6 px-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">答题卡</span>
              <span className="text-xs text-slate-400 ml-auto">{Object.keys(answers).length}/{section.questions.length} 已答</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {section.questions.map((q,i) => {
                const hasAnswer = !!answers[q.id];
                const isCorrect = submitted && (answers[q.id]||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                let cls = 'bg-slate-100 text-slate-500 border-slate-200';
                if (submitted && hasAnswer) cls = isCorrect ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300';
                else if (hasAnswer) cls = 'bg-primary-100 text-primary-700 border-primary-300';
                return (
                  <button key={q.id} onClick={() => jumpToQuestion(i+1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors hover:shadow ${cls}`}>
                    {i+1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!submitted && section.questions.length > 0 && (
          <button onClick={handleSubmit} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 sticky bottom-0">提交答案</button>
        )}

        {/* Writing prompt */}
        {activeSection === 'writing' && section.writingPrompt && (
          <div className="bg-white rounded-xl border p-4">
            <div className="text-sm text-slate-700 whitespace-pre-line mb-3">{section.writingPrompt}</div>
            <div className="text-xs text-slate-400">{section.writingPromptCn}</div>
            <textarea className="mt-4 w-full h-64 p-4 border rounded-xl text-sm resize-none focus:outline-none focus:border-green-400"
              placeholder="在此输入你的作文..."/>
          </div>
        )}

        {/* Audio script (after submission for listening) */}
        {submitted && activeSection === 'listening' && section.audioScript && (
          <div className="bg-amber-50 rounded-xl p-4">
            <h3 className="font-semibold text-amber-700 mb-2">📝 录音原文 (Transcript)</h3>
            <ClickableText>
              <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{section.audioScript}</div>
            </ClickableText>
          </div>
        )}

        {/* Questions */}
        {section.questions.length > 0 && (
          <div className="space-y-3">
            {section.questions.map((q,i) => {
              const isCorrect = (answers[q.id]||'').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
              return (
                <div key={q.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-400 shrink-0 mt-0.5">Q{i+1}.</span>
                    <ClickableText>
                      <span className="text-sm text-slate-700 cursor-pointer select-text">{q.questionText}</span>
                    </ClickableText>
                  </div>
                  {q.options ? (
                    <div className="space-y-1.5 ml-6">
                      {q.options.map((opt:string,oi:number) => {
                        let cls = 'border-slate-200 hover:bg-slate-50';
                        if (submitted) {
                          if (opt === q.correctAnswer) cls = 'border-green-400 bg-green-50 text-green-700 font-medium';
                          else if (opt === answers[q.id]) cls = 'border-red-400 bg-red-50 text-red-700';
                          else cls = 'border-slate-100 text-slate-400';
                        } else if (opt === answers[q.id]) cls = 'border-green-400 bg-green-50';
                        return (
                          <button key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[q.id]:opt}))} disabled={submitted}
                            className={`w-full p-2.5 rounded-lg border text-left text-sm transition-colors ${cls}`}>
                            {String.fromCharCode(65+oi)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input type="text" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                      disabled={submitted}
                      className={`ml-6 p-2.5 border rounded-lg text-sm w-full max-w-xs ${submitted?(isCorrect?'border-green-400 bg-green-50':'border-red-400 bg-red-50'):'border-slate-200'} focus:outline-none`}
                      placeholder="输入答案..."/>
                  )}
                  {submitted && (
                    <div className={`mt-2 ml-6 p-2 rounded-lg text-sm ${isCorrect?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        {isCorrect ? <><Check size={16} className="text-green-600"/><span className="text-green-700">正确</span></>
                          : <><X size={16} className="text-red-600"/><span className="text-red-700">正确答案: {q.correctAnswer}</span></>}
                      </div>
                      <div className="flex items-start gap-1 text-xs"><Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5"/><span className="text-slate-600">{q.explanationCn}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!submitted && section.questions.length > 0 && (
          <button onClick={handleSubmit} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700">提交答案</button>
        )}

        {submitted && (
          <div className="space-y-4">
            <div className={`rounded-xl p-6 text-center ${(sectionScores[activeSection]||0)>=60?'bg-green-50 border border-green-200':'bg-amber-50 border border-amber-200'}`}>
              <div className={`text-4xl font-bold ${(sectionScores[activeSection]||0)>=60?'text-green-600':'text-amber-600'}`}>{sectionScores[activeSection]||0}%</div>
              <div className="text-sm text-slate-500 mt-1">正确率</div>
            </div>
            <button onClick={()=>{setActiveSection(null);setSubmitted(false);setAnswers({})}}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">返回试卷</button>
          </div>
        )}
      </div>
    );
  }

  // Section selection
  return (
    <div className="space-y-6">
      <button onClick={handleBack} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"><ArrowLeft size={16}/> 返回</button>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">剑雅{test.bookNumber} Test {test.testNumber}</h1>
        <p className="text-slate-500 mt-1">选择科目开始答题</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([{key:'listening'as const,icon:Headphones,label:'听力',time:'30分钟',color:'bg-blue-500'},
           {key:'reading'as const,icon:FileText,label:'阅读',time:'60分钟',color:'bg-green-500'},
           {key:'writing'as const,icon:PenLine,label:'写作',time:'60分钟',color:'bg-purple-500'}] as const).map(({key,icon:Icon,label,time,color})=>{
          const sec = test.sections[key];
          const score = sectionScores[`real-${test.id}-${key}`];
          return (
            <button key={key} onClick={()=>sec&&handleStartSection(key)} disabled={!sec}
              className={`bg-white rounded-xl p-6 shadow-sm border text-left transition-all ${sec?'hover:border-green-300 hover:shadow-md':'opacity-40'}`}>
              <div className="flex items-center gap-4">
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}><Icon size={24} className="text-white"/></div>
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{label}</div>
                  <div className="text-sm text-slate-500"><Clock size={14} className="inline mr-1"/>{time} · {sec?.questions?.length||0} 题</div>
                  {score !== undefined && <div className={`text-sm font-bold mt-1 ${score>=60?'text-green-600':'text-red-500'}`}>{score}%</div>}
                </div>
                {sec && <ChevronRight size={20} className="text-slate-300 ml-auto"/>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
