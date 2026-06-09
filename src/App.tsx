import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy imports for code splitting
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';

// English pages
import VocabularyStudy from './pages/english/VocabularyStudy';
import GrammarLesson from './pages/english/GrammarLesson';
import Conversation from './pages/english/Conversation';
import Reading from './pages/english/Reading';
import Dictation from './pages/english/Dictation';

// Daily pages
import DailyWords from './pages/daily/DailyWords';
import Spelling from './pages/daily/Spelling';

// IELTS pages
import IeltsListening from './pages/ielts/Listening';
import IeltsReading from './pages/ielts/Reading';
import IeltsWriting from './pages/ielts/Writing';
import IeltsSpeaking from './pages/ielts/Speaking';
import IeltsDictionary from './pages/ielts/Dictionary';
import IeltsPastPapers from './pages/ielts/PastPapers';
import IeltsRealExams from './pages/ielts/RealExams';

// Other
import TestMode from './pages/TestMode';
import Review from './pages/Review';
import Stats from './pages/Stats';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<LearningPath />} />
          <Route path="learn/vocabulary" element={<VocabularyStudy />} />
          <Route path="learn/grammar" element={<GrammarLesson />} />
          <Route path="learn/conversation" element={<Conversation />} />
          <Route path="learn/reading" element={<Reading />} />
          <Route path="learn/dictation" element={<Dictation />} />
          <Route path="daily/words" element={<DailyWords />} />
          <Route path="daily/spelling" element={<Spelling />} />
          <Route path="ielts/listening" element={<IeltsListening />} />
          <Route path="ielts/reading" element={<IeltsReading />} />
          <Route path="ielts/writing" element={<IeltsWriting />} />
          <Route path="ielts/speaking" element={<IeltsSpeaking />} />
          <Route path="ielts/dictionary" element={<IeltsDictionary />} />
          <Route path="ielts/exams" element={<IeltsPastPapers />} />
          <Route path="ielts/real" element={<IeltsRealExams />} />
          <Route path="test" element={<TestMode />} />
          <Route path="review/:sessionId" element={<Review />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
