// ============================================================
// 雅思备考类型定义
// ============================================================

export type IeltsDifficulty = 'basic' | 'standard' | 'advanced';
export type IeltsQuestionType = 'multiple-choice' | 'fill-blank' | 'true-false-ng' | 'matching' | 'short-answer' | 'map-labeling';

export interface IeltsQuestion {
  id: string;
  type: IeltsQuestionType;
  questionText: string;
  questionTextCn?: string;
  options?: string[];
  correctAnswer: string;
  explanationCn: string;
}

// 雅思听力
export interface IeltsListeningTest {
  id: string;
  title: string;
  section: 1 | 2 | 3 | 4;
  audioSrc?: string;
  transcript?: string;
  transcriptCn?: string;
  questions: IeltsQuestion[];
  difficulty: IeltsDifficulty;
  stage: number;
}

// 雅思阅读
export interface IeltsReadingPassage {
  id: string;
  title: string;
  passage: string;
  passageCn?: string;
  questions: IeltsQuestion[];
  timeLimit: number;
  difficulty: IeltsDifficulty;
  stage: number;
}

// 雅思写作
export interface IeltsWritingTask {
  id: string;
  taskNumber: 1 | 2;
  prompt: string;
  promptCn?: string;
  chartDescription?: string;
  wordLimit: number;
  timeLimit: number;
  sampleAnswer?: string;
  sampleAnswerCn?: string;
  scoringCriteria: string[];
  difficulty: IeltsDifficulty;
  stage: number;
}

// 雅思口语
export interface IeltsSpeakingPrompt {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  prompt: string;
  promptCn?: string;
  followUpQuestions?: string[];
  sampleAnswer?: string;
  sampleAnswerCn?: string;
  tips: string[];
  difficulty: IeltsDifficulty;
  stage: number;
}

// 雅思词典
export interface DictionaryEntry {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
  definitionCn: string;
  exampleSentences: { en: string; cn: string }[];
  synonyms: string[];
  collocations: string[];
  frequency: 'high' | 'medium' | 'low';
  category: string;
}

// 考试会话
export interface TestSession {
  id: string;
  type: 'listening' | 'reading' | 'writing' | 'speaking' | 'full';
  startedAt: string;
  completedAt?: string;
  answers: Record<string, string>;
  score?: number;
  totalQuestions: number;
  timeLimit: number;
}

// 每日单词记录
export interface DailyWordRecord {
  date: string;
  words: string[];
  completed: string[];
  reviewWords: string[];
}

// 拼写记录
export interface SpellingRecord {
  wordId: string;
  attempts: number;
  correct: number;
  lastAttempt: string;
  nextReview: string;
}

// 用户进度
export interface UserProgress {
  id: string;
  completedLessons: Record<string, boolean>;
  completedStages: Record<number, number>;
  testScores: Record<string, number>;
  streak: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  wordsPerDay: number;
  vocabularyKnown: string[];
  vocabReviewList: string[];
  checkInDates: string[];
  vocabPosition: { topic: string; index: number };
}

// ====== 剑桥雅思真题卷 ======
export type ExamSection = 'listening' | 'reading' | 'writing' | 'speaking';

export interface IeltsExamTest {
  id: string;
  bookNumber: number;        // 剑雅 1-12
  testNumber: number;        // Test 1-4
  sections: {
    listening?: IeltsExamSection;
    reading?: IeltsExamSection;
    writing?: IeltsExamSection;
    speaking?: IeltsExamSection;
  };
}

export interface IeltsExamSection {
  title: string;
  timeLimit: number;         // minutes
  instructions: string;
  instructionsCn: string;
  questions: ExamQuestion[];
  passages?: ExamPassage[];  // for reading
  audioScript?: string;      // for listening
  audioScriptCn?: string;
  writingPrompt?: string;    // for writing
  writingPromptCn?: string;
  speakingPrompt?: string;   // for speaking
  speakingPromptCn?: string;
}

export interface ExamQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-ng' | 'matching' | 'short-answer' | 'sentence-completion';
  questionText: string;
  questionTextCn?: string;
  options?: string[];
  correctAnswer: string;
  explanationCn: string;
  sectionRef?: string;       // Which section/passage this question belongs to
}

export interface ExamPassage {
  id: string;
  title: string;
  content: string;
  contentCn?: string;
}
