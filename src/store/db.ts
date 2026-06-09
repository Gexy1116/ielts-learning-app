import Dexie, { type Table } from 'dexie';
import type { UserProgress, DailyWordRecord, SpellingRecord, TestSession } from '../types/ielts';

export class IeltsAppDB extends Dexie {
  userProgress!: Table<UserProgress, string>;
  dailyWords!: Table<DailyWordRecord, string>;
  spellingRecords!: Table<SpellingRecord, string>;
  testSessions!: Table<TestSession, string>;
  vocabularyBook!: Table<{ id: string; word: string; translation: string; addedAt: string; mastered: boolean }, string>;

  constructor() {
    super('IeltsLearningApp');
    this.version(1).stores({
      userProgress: '&id',
      dailyWords: '&date',
      spellingRecords: '&wordId',
      testSessions: '&id',
      vocabularyBook: '&id',
    });
  }
}

export const db = new IeltsAppDB();

export async function getOrCreateProgress(): Promise<UserProgress> {
  const existing = await db.userProgress.get('main');
  if (existing) return existing;

  const progress: UserProgress = {
    id: 'main',
    completedLessons: {},
    completedStages: {},
    testScores: {},
    streak: 0,
    lastActiveDate: '',
    totalStudyMinutes: 0,
    wordsPerDay: 10,
    vocabularyKnown: [],
    vocabReviewList: [],
    checkInDates: [],
    vocabPosition: { topic: 'all', index: 0 },
  };
  await db.userProgress.put(progress);
  return progress;
}

export async function checkInToday(): Promise<{ streak: number; isNewCheckIn: boolean }> {
  const progress = await getOrCreateProgress();
  const today = new Date().toISOString().split('T')[0];

  if (progress.checkInDates.includes(today)) {
    return { streak: progress.streak, isNewCheckIn: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = progress.checkInDates.includes(yesterday) ? progress.streak + 1 : 1;

  progress.checkInDates.push(today);
  progress.streak = newStreak;
  progress.lastActiveDate = today;
  await db.userProgress.put(progress);

  return { streak: newStreak, isNewCheckIn: true };
}

export async function getTodayWords(): Promise<{ newWords: string[]; reviewWords: string[] }> {
  const today = new Date().toISOString().split('T')[0];
  const record = await db.dailyWords.get(today);

  if (!record) {
    return { newWords: [], reviewWords: [] };
  }

  return {
    newWords: record.words.filter(w => !record.completed.includes(w)),
    reviewWords: record.reviewWords.filter(w => !record.completed.includes(w)),
  };
}

// ====== Study Tracking Utilities ======

export async function addStudyTime(minutes: number): Promise<void> {
  if (minutes <= 0) return;
  const progress = await getOrCreateProgress();
  progress.totalStudyMinutes = (progress.totalStudyMinutes || 0) + minutes;
  await db.userProgress.put(progress);
}

export async function completeLesson(lessonId: string, stageId?: number): Promise<void> {
  const progress = await getOrCreateProgress();
  progress.completedLessons[lessonId] = true;
  if (stageId !== undefined) {
    progress.completedStages[stageId] = (progress.completedStages[stageId] || 0) + 1;
  }
  await db.userProgress.put(progress);
}

export async function saveTestScore(testId: string, score: number): Promise<void> {
  const progress = await getOrCreateProgress();
  progress.testScores[testId] = score;
  await db.userProgress.put(progress);
}

export async function saveTestSession(session: TestSession): Promise<void> {
  await db.testSessions.put(session);
}

export async function getTestSession(id: string): Promise<TestSession | undefined> {
  return db.testSessions.get(id);
}

export async function getAllTestSessions(): Promise<TestSession[]> {
  return db.testSessions.orderBy('startedAt').reverse().toArray();
}

export async function saveSpellingResult(wordId: string, correct: boolean): Promise<void> {
  const existing = await db.spellingRecords.get(wordId);
  const today = new Date().toISOString().split('T')[0];
  const nextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (existing) {
    existing.attempts += 1;
    if (correct) existing.correct += 1;
    existing.lastAttempt = today;
    existing.nextReview = correct ? nextDay : today; // review wrong words same day
    await db.spellingRecords.put(existing);
  } else {
    await db.spellingRecords.put({
      wordId,
      attempts: 1,
      correct: correct ? 1 : 0,
      lastAttempt: today,
      nextReview: correct ? nextDay : today,
    });
  }
}

export async function getSavedVocabularyWords(): Promise<{ id: string; word: string; translation: string; addedAt: string; mastered: boolean }[]> {
  return db.vocabularyBook.toArray();
}
