import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BookMarked, Mic, Headphones,
  PenLine, MessageCircle, GraduationCap, BarChart3,
  Library, Calendar, type LucideIcon
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/learn', label: '学习路径', icon: GraduationCap },
];

const dailyNav: NavItem[] = [
  { to: '/daily/words', label: '每日背单词', icon: Calendar },
  { to: '/daily/spelling', label: '拼写练习', icon: PenLine },
];

const englishNav: NavItem[] = [
  { to: '/learn/vocabulary', label: '词汇学习', icon: BookOpen },
  { to: '/learn/grammar', label: '语法课程', icon: BookMarked },
  { to: '/learn/conversation', label: '对话练习', icon: MessageCircle },
  { to: '/learn/reading', label: '分级阅读', icon: Library },
  { to: '/learn/dictation', label: '听写训练', icon: Headphones },
];

const ieltsNav: NavItem[] = [
  { to: '/ielts/listening', label: '雅思听力', icon: Headphones },
  { to: '/ielts/reading', label: '雅思阅读', icon: BookOpen },
  { to: '/ielts/writing', label: '雅思写作', icon: PenLine },
  { to: '/ielts/speaking', label: '雅思口语', icon: Mic },
  { to: '/ielts/dictionary', label: '雅思词典', icon: Library },
  { to: '/ielts/real', label: '雅思真题', icon: BookMarked },
  { to: '/ielts/exams', label: '模拟真题卷', icon: BookMarked },
];

const otherNav: NavItem[] = [
  { to: '/test', label: '模拟考试', icon: GraduationCap },
  { to: '/stats', label: '学习统计', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-4">
      {!collapsed && (
        <h3 className="px-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <aside
      className={`bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <GraduationCap size={28} className="text-primary-600 shrink-0" />
        {!collapsed && (
          <span className="font-bold text-slate-800 text-lg whitespace-nowrap">IELTS Learn</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 pt-4">
        <NavSection title="主页" items={mainNav} />
        <NavSection title="每日任务" items={dailyNav} />
        <NavSection title="基础英语" items={englishNav} />
        <NavSection title="雅思备考" items={ieltsNav} />
        <NavSection title="考试" items={otherNav} />
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 m-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-xs"
      >
        {collapsed ? '→' : '← 收起'}
      </button>
    </aside>
  );
}
