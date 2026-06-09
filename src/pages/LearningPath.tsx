import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrCreateProgress } from '../store/db';
import { learningStages } from '../data/learning-path';
import {
  Lock, CheckCircle2, Circle, ChevronRight, BookOpen,
  Clock, Zap
} from 'lucide-react';
import type { UserProgress } from '../types/ielts';
import type { LearningStage } from '../types';

const stageIcons: Record<string, React.ReactNode> = {
  'book-open': <BookOpen size={28} />,
  'zap': <Zap size={28} />,
  'target': <CheckCircle2 size={28} />,
};

export default function LearningPath() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  useEffect(() => {
    getOrCreateProgress().then(setProgress);
  }, []);

  const isStageUnlocked = (stage: LearningStage): boolean => {
    if (stage.id === 0) return true;
    const prevStage = learningStages[stage.id - 1];
    if (!prevStage) return true;
    const completed = progress?.completedStages?.[prevStage.id] || 0;
    return completed >= prevStage.requiredToUnlock;
  };

  const getStageProgress = (stageId: number): number => {
    const stage = learningStages[stageId];
    const completed = progress?.completedStages?.[stageId] || 0;
    return Math.min(100, Math.round((completed / stage.totalLessons) * 100));
  };

  const getLessonPath = (type: string): string => {
    const map: Record<string, string> = {
      vocabulary: '/learn/vocabulary',
      grammar: '/learn/grammar',
      conversation: '/learn/conversation',
      reading: '/learn/reading',
      dictation: '/learn/dictation',
      'ielts-listening': '/ielts/listening',
      'ielts-reading': '/ielts/reading',
      'ielts-writing': '/ielts/writing',
      'ielts-speaking': '/ielts/speaking',
    };
    return map[type] || '/learn';
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">学习路径</h1>
        <p className="text-slate-500 mt-1">从初级英语到雅思冲刺，系统化提升英语能力</p>
      </div>

      <div className="space-y-4">
        {learningStages.map((stage) => {
          const unlocked = isStageUnlocked(stage);
          const pct = getStageProgress(stage.id);
          const isExpanded = expandedStage === stage.id;

          return (
            <div key={stage.id}
              className={`bg-white rounded-xl border-2 transition-all ${
                unlocked ? 'border-slate-200 hover:border-primary-300' : 'border-slate-100 opacity-60'
              }`}
            >
              {/* Stage Header */}
              <button
                onClick={() => unlocked && setExpandedStage(isExpanded ? null : stage.id)}
                className="w-full p-5 flex items-center gap-4 text-left"
                disabled={!unlocked}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: stage.color }}
                >
                  {unlocked ? (
                    pct === 100 ? <CheckCircle2 size={28} /> : stageIcons[stage.icon] || <BookOpen size={28} />
                  ) : (
                    <Lock size={28} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      阶段 {stage.id}
                    </span>
                    <h3 className="font-semibold text-slate-800">{stage.nameCn}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{stage.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-medium text-slate-600">{pct}%</div>
                  <div className="w-20 h-2 bg-slate-100 rounded-full mt-1">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>

                {unlocked && (
                  <ChevronRight
                    size={20}
                    className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                )}
              </button>

              {/* Expanded Lessons */}
              {isExpanded && unlocked && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  <div className="grid gap-2">
                    {stage.lessons.map((lesson) => {
                      const isCompleted = progress?.completedLessons?.[lesson.id];
                      return (
                        <Link
                          key={lesson.id}
                          to={getLessonPath(lesson.type)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isCompleted
                              ? 'bg-green-50 hover:bg-green-100'
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : (
                            <Circle size={18} className="text-slate-300" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-700">{lesson.titleCn}</div>
                            <div className="text-xs text-slate-400">{lesson.title}</div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={12} />
                            {lesson.duration}分钟
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
