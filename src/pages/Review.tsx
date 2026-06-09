import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllTestSessions } from '../store/db';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { TestSession } from '../types/ielts';

export default function Review() {
  const { sessionId } = useParams();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTestSessions().then(s => {
      setSessions(s);
      setLoading(false);
    });
  }, []);

  const selectedSession = sessionId
    ? sessions.find(s => s.id === sessionId)
    : sessions[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">暂无测试记录</h2>
        <p className="text-slate-500 mb-4">完成模拟真题卷后，成绩和解析会出现在这里</p>
        <Link to="/ielts/exams" className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium">
          去做一套真题
        </Link>
      </div>
    );
  }

  if (!selectedSession) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">未找到该测试记录</p>
        <Link to="/review" className="text-primary-500 text-sm mt-2 inline-block">查看所有记录</Link>
      </div>
    );
  }

  const score = selectedSession.score || 0;
  const pct = selectedSession.totalQuestions > 0
    ? Math.round((score / selectedSession.totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/stats" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> 返回统计
        </Link>
        {sessions.length > 1 && !sessionId && (
          <span className="text-xs text-slate-400">共 {sessions.length} 条记录</span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">测试回顾</h1>
        <p className="text-slate-500 mt-1">查看过往测试成绩</p>
      </div>

      {/* Session list (if no specific session selected) */}
      {!sessionId && sessions.length > 1 && (
        <div className="space-y-2">
          {sessions.slice(0, 10).map(s => (
            <Link key={s.id} to={`/review/${s.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-primary-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-700">{s.type} · {s.id}</div>
                  <div className="text-xs text-slate-400">{s.startedAt?.split('T')[0] || '未知日期'}</div>
                </div>
                <div className={`text-lg font-bold ${(s.score || 0) >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                  {s.score || 0}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Score summary for selected session */}
      {(sessionId || sessions.length === 1) && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-400">测试成绩</div>
                <div className="text-4xl font-bold text-primary-600">{pct}%</div>
                <div className="text-sm text-slate-500 mt-1">{score}/{selectedSession.totalQuestions} 题正确</div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>{selectedSession.startedAt?.split('T')[0] || '未知日期'}</div>
                <div>{selectedSession.type}</div>
                <div>限时 {selectedSession.timeLimit} 分钟</div>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Answer review */}
          {selectedSession.answers && Object.keys(selectedSession.answers).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700">答题详情</h3>
              {Object.entries(selectedSession.answers).map(([qId, userAns], i) => {
                const isCorrect = userAns === 'correct'; // simplified
                return (
                  <div key={qId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">第{i + 1}题</span>
                      <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        你的答案: {userAns}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
