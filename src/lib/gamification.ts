
import { type User } from 'firebase/auth';
import { Firestore, collection, query, where, Timestamp, getDocs, writeBatch, doc } from 'firebase/firestore';

export const levels = [
    { level: 1, minPoints: 0, title: 'Beginner' },
    { level: 2, minPoints: 100, title: 'Beginner' },
    { level: 3, minPoints: 250, title: 'Scholar' },
    { level: 4, minPoints: 500, title: 'Scholar' },
    { level: 5, minPoints: 800, title: 'Expert' },
    { level: 6, minPoints: 1200, title: 'Expert' },
    { level: 7, minPoints: 1700, title: 'Master' },
    { level: 8, minPoints: 2300, title: 'Master' },
    { level: 9, minPoints: 3000, title: 'Grandmaster' },
    { level: 10, minPoints: 4000, title: 'Grandmaster' },
    { level: 11, minPoints: 5000, title: 'Ustaad' },
];

type LevelInfo = {
    level: number;
    title: string;
    progress: number; // Percentage to next level
};

export function getLevelInfo(points: number): LevelInfo {
    let currentLevelInfo = levels[0];
    let nextLevelInfo = levels[1];

    for (let i = 0; i < levels.length; i++) {
        if (points >= levels[i].minPoints) {
            currentLevelInfo = levels[i];
            if (i < levels.length - 1) {
                nextLevelInfo = levels[i + 1];
            } else {
                // Max level
                return {
                    level: currentLevelInfo.level,
                    title: currentLevelInfo.title,
                    progress: 100,
                };
            }
        } else {
            break;
        }
    }
    
    const pointsInCurrentLevel = points - currentLevelInfo.minPoints;
    const pointsForNextLevel = nextLevelInfo.minPoints - currentLevelInfo.minPoints;
    const progress = Math.min(Math.floor((pointsInCurrentLevel / pointsForNextLevel) * 100), 100);

    return {
        level: currentLevelInfo.level,
        title: currentLevelInfo.title,
        progress: progress,
    };
}

export type EnrichedUser = User & {
    points: number;
    level: number;
    levelTitle: string;
    progress: number;
    streak: number;
};

export const dailyChallengeDefs = [
  { id: 'quiz-master', title: 'Quiz Master', description: 'Complete 2 quizzes.' },
  { id: 'perfect-score', title: 'Perfectionist', description: 'Get a 100% score on one quiz.' },
  { id: 'flashcard-focus', title: 'Flashcard Focus', description: 'Review 20 flashcards.' },
  { id: 'streak-keeper', title: 'Streak Keeper', description: 'Log in to keep your streak alive.' },
  { id: 'voice-explorer', title: 'Voice Explorer', description: 'Use the Voice Tutor 3 times.' },
  { id: 'subject-switcher', title: 'Subject Switcher', description: 'Take quizzes on 3 different subjects.' },
  { id: 'fast-learner', title: 'Fast Learner', description: 'Complete a quiz in under 5 minutes.' },
];

export async function ensureDailyChallengesClient(firestore: Firestore, userId: string) {
    const challengesRef = collection(firestore, 'users', userId, 'daily_challenges');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(challengesRef, where('expiresAt', '>=', todayTimestamp));
    
    try {
        const existingChallenges = await getDocs(q);

        if (existingChallenges.empty) {
            const batch = writeBatch(firestore);
            const expiresAt = new Date();
            expiresAt.setHours(23, 59, 59, 999);

            // Simple shuffle and pick 3
            const selectedChallenges = [...dailyChallengeDefs].sort(() => 0.5 - Math.random()).slice(0, 3);

            selectedChallenges.forEach(challengeDef => {
                const newChallengeRef = doc(challengesRef);
                const challengeData = {
                    challengeId: challengeDef.id,
                    title: challengeDef.title,
                    description: challengeDef.description,
                    progress: 0,
                    goal: challengeDef.id.includes('quiz') ? 2 : (challengeDef.id.includes('flashcard') ? 20 : (challengeDef.id.includes('voice') ? 3 : (challengeDef.id.includes('subject') ? 3 : 1))),
                    completed: false,
                    expiresAt: Timestamp.fromDate(expiresAt),
                };
                batch.set(newChallengeRef, challengeData);
            });

            await batch.commit();
            console.log(`Generated new daily challenges for user ${userId} client-side`);
        }
    } catch (error) {
        console.error("Error in ensureDailyChallengesClient:", error);
    }
}
