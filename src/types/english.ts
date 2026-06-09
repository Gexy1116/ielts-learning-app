// ============================================================
// 基础英语学习类型定义
// ============================================================

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  topic: string;
  stage: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isIeltsCore: boolean;
}

export interface GrammarPoint {
  id: string;
  title: string;
  titleCn: string;
  explanation: string;
  explanationCn: string;
  examples: { en: string; cn: string }[];
  stage: number;
  exercises: GrammarExercise[];
}

export interface GrammarExercise {
  id: string;
  type: 'fill-blank' | 'multiple-choice' | 'reorder' | 'correction';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanationCn: string;
}

export interface Conversation {
  id: string;
  title: string;
  scenario: string;
  dialogues: { speaker: string; text: string; translation: string }[];
  keyPhrases: { phrase: string; translation: string }[];
  stage: number;
}

export interface GradedReading {
  id: string;
  title: string;
  level: number;
  content: string;
  contentCn: string;
  source?: string;
  vocabHighlights: { word: string; translation: string }[];
  questions: ReadingQuestion[];
  stage: number;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanationCn: string;
}

export interface DictationExercise {
  id: string;
  level: number;
  title: string;
  sentences: DictationSentence[];
  stage: number;
}

export interface DictationSentence {
  audioText: string;
  correctText: string;
  translation: string;
}
