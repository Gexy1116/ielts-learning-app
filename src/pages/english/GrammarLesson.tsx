import { useState } from 'react';
import { grammarPoints } from '../../data/english/grammar';
import { completeLesson, addStudyTime } from '../../store/db';
import { ChevronRight, Check, X, BookOpen } from 'lucide-react';
import type { GrammarPoint, GrammarExercise } from '../../types/english';

export default function GrammarLesson() {
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = (point: GrammarPoint) => {
    setSelectedPoint(point);
    setExerciseIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setCorrectCount(0);
    setQuizStarted(true);
  };

  const currentExercise: GrammarExercise | null =
    selectedPoint && selectedPoint.exercises[exerciseIndex] || null;

  const checkAnswer = (answer?: string) => {
    const ans = (answer ?? userAnswer).trim().toLowerCase();
    setShowResult(true);
    if (currentExercise && ans === currentExercise.correctAnswer.toLowerCase()) {
      setCorrectCount(c => c + 1);
    }
  };

  const nextExercise = () => {
    if (selectedPoint && exerciseIndex < selectedPoint.exercises.length - 1) {
      setExerciseIndex(i => i + 1);
      setUserAnswer('');
      setShowResult(false);
    }
  };

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">语法课程</h1>
          <p className="text-slate-500 mt-1">选择语法知识点，学习+练习巩固</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {grammarPoints.map(point => (
            <button
              key={point.id}
              onClick={() => startQuiz(point)}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-left hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-primary-600">{point.titleCn}</h3>
                  <p className="text-sm text-slate-400 mt-1">{point.title}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-400" />
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                <BookOpen size={14} /> {point.exercises.length} 道练习题
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => { setQuizStarted(false); setSelectedPoint(null); }}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium">
        ← 返回课程列表
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800">{selectedPoint?.titleCn}</h2>
        <p className="text-sm text-slate-400 mt-1 mb-4">{selectedPoint?.title}</p>

        {/* Explanation */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-slate-700 mb-2">📖 语法讲解</h3>
          <p className="text-sm text-slate-600 whitespace-pre-line">{selectedPoint?.explanationCn}</p>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <h4 className="text-sm font-medium text-slate-600 mb-2">例句</h4>
            {selectedPoint?.examples.map((ex, i) => (
              <div key={i} className="text-sm mb-1">
                <span className="text-slate-700">{ex.en}</span>
                <br />
                <span className="text-slate-400 text-xs">{ex.cn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise */}
        {currentExercise && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">
                练习 {exerciseIndex + 1}/{selectedPoint?.exercises.length}
              </span>
              <span className="text-sm font-medium text-slate-600">✅ {correctCount}</span>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 mb-4">
              <p className="text-slate-700 font-medium">{currentExercise.question}</p>
            </div>

            {currentExercise.type === 'multiple-choice' && currentExercise.options ? (
              <div className="space-y-2">
                {currentExercise.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setUserAnswer(opt); if (!showResult) checkAnswer(opt); }}
                    className={`w-full p-3 rounded-lg text-left text-sm border transition-colors ${
                      showResult
                        ? opt === currentExercise.correctAnswer
                          ? 'border-green-400 bg-green-50 text-green-700'
                          : opt === userAnswer
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                        : userAnswer === opt
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !showResult) checkAnswer(); }}
                  placeholder="输入你的答案..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  disabled={showResult}
                />
                {!showResult && (
                  <button onClick={() => checkAnswer()}
                    className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">
                    确认
                  </button>
                )}
              </div>
            )}

            {showResult && (
              <div className={`mt-4 p-4 rounded-xl ${
                userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase()
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase()
                    ? <><Check size={18} /> 正确!</>
                    : <><X size={18} /> 错误! 正确答案: {currentExercise.correctAnswer}</>
                  }
                </div>
                <p className="text-sm mt-1">{currentExercise.explanationCn}</p>
                {exerciseIndex < (selectedPoint?.exercises.length || 0) - 1 && (
                  <button onClick={nextExercise}
                    className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">
                    下一题 →
                  </button>
                )}
              </div>
            )}

            {exerciseIndex === (selectedPoint?.exercises.length || 0) - 1 && showResult && (() => {
              // Mark lesson as completed
              completeLesson(selectedPoint!.id, selectedPoint!.stage);
              addStudyTime(Math.ceil((selectedPoint?.exercises.length || 1) / 2));
              return null;
            })()}
            {exerciseIndex === (selectedPoint?.exercises.length || 0) - 1 && showResult && (
              <div className="mt-6 text-center p-6 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  🎉 完成! {correctCount}/{selectedPoint?.exercises.length}
                </div>
                <button onClick={() => setQuizStarted(false)}
                  className="mt-3 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium">
                  返回课程列表
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
