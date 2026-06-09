export type LessonType =
  | 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'dictation'
  | 'ielts-listening' | 'ielts-reading' | 'ielts-writing' | 'ielts-speaking';

export interface LearningStage {
  id: number;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  requiredToUnlock: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  stageId: number;
  title: string;
  titleCn: string;
  type: LessonType;
  duration: number;
  contentId?: string;
}
