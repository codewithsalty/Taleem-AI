
'use server';

import { generateEmbedding } from './flows/embedding-flow';
import { type CurriculumContent } from '@/lib/types';

// Mock in-memory knowledge base with the new schema
const knowledgeBase: Omit<CurriculumContent, 'id' | 'createdAt' | 'embedding'>[] = [
    // Math Grade 3: Fractions
    {
        subject: 'Math', grade: 3, board: 'Punjab', chapter: 5, chapterName: 'Fractions', topic: 'Introduction to Fractions',
        content: 'A fraction represents a part of a whole. When an object or number is divided into equal parts, each part is a fraction of the whole. For example, a pizza divided into 8 equal slices means each slice is 1/8 of the pizza.',
        urduContent: 'کسر ایک مکمل کا حصہ ہے۔ جب کسی چیز یا عدد کو برابر حصوں میں تقسیم کیا جاتا ہے، تو ہر حصہ اس مکمل کا کسر ہوتا ہے۔ مثال کے طور پر، ایک پیزا کو 8 برابر ٹکڑوں میں تقسیم کیا جائے تو ہر ٹکڑا پیزا کا 1/8 حصہ ہے۔',
        examples: ['1/2 of an apple', '3/4 of a cake'], keywords: ['fraction', 'whole', 'part', 'division']
    },
    {
        subject: 'Math', grade: 3, board: 'Punjab', chapter: 5, chapterName: 'Fractions', topic: 'Numerator and Denominator',
        content: 'A fraction has two parts: the numerator and the denominator. The denominator is the bottom number, showing the total number of equal parts. The numerator is the top number, showing how many of those parts we have.',
        urduContent: 'کسر کے دو حصے ہوتے ہیں: شمار کنندہ اور نسب نما۔ نسب نما نیچے والا عدد ہے، جو کل برابر حصوں کی تعداد کو ظاہر کرتا ہے۔ شمار کنندہ اوپر والا عدد ہے، جو یہ ظاہر کرتا ہے کہ ہمارے پاس ان میں سے کتنے حصے ہیں۔',
        examples: ['In 3/5, 3 is the numerator, 5 is the denominator.'], keywords: ['numerator', 'denominator', 'top number', 'bottom number']
    },
    // Urdu Grade 4: Qaida
    {
        subject: 'Urdu', grade: 4, board: 'Sindh', chapter: 1, chapterName: 'Haroof-e-Tahajji', topic: 'Basic Alphabet',
        content: 'The Urdu alphabet, or Haroof-e-Tahajji, consists of 38 letters. It is written from right to left. Each letter has a unique sound.',
        urduContent: 'اردو حروف تہجی 38 حروف پر مشتمل ہیں۔ یہ دائیں سے بائیں لکھی جاتی ہے۔ ہر حرف کی ایک منفرد آواز ہوتی ہے۔',
        examples: ['Alif (ا), Bay (ب), Pay (پ)'], keywords: ['Urdu', 'alphabet', 'Haroof-e-Tahajji']
    },
    {
        subject: 'Urdu', grade: 4, board: 'Sindh', chapter: 1, chapterName: 'Haroof-e-Tahajji', topic: 'Joining Letters',
        content: 'Urdu letters change their shape when they are joined together to form words. Letters can have initial, medial, and final forms.',
        urduContent: 'اردو کے حروف الفاظ بنانے کے لیے جب ایک ساتھ ملائے جاتے ہیں تو اپنی شکل بدل لیتے ہیں۔ حروف کی ابتدائی، درمیانی اور آخری شکلیں ہو سکتی ہیں۔',
        examples: ['ب in its initial form looks different than in its final form.'], keywords: ['joining letters', 'forms', 'words']
    },
    // Science Grade 5: Photosynthesis
    {
        subject: 'Science', grade: 5, board: 'Federal', chapter: 3, chapterName: 'Life Functions', topic: 'Photosynthesis',
        content: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigment. It is a vital process for life on Earth.',
        urduContent: 'ضیائی تالیف وہ عمل ہے جس کے ذریعے سبز پودے اور کچھ دوسرے جاندار کلوروفل کی مدد سے سورج کی روشنی کا استعمال کرتے ہوئے خوراک تیار کرتے ہیں۔ یہ زمین پر زندگی کے لیے ایک اہم عمل ہے۔',
        examples: ['A tree making its own food.'], keywords: ['photosynthesis', 'sunlight', 'chlorophyll', 'plants']
    },
    {
        subject: 'Science', grade: 5, board: 'Federal', chapter: 3, chapterName: 'Life Functions', topic: 'Inputs and Outputs of Photosynthesis',
        content: 'During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds like glucose.',
        urduContent: 'سبز پودوں میں ضیائی تالیف کے دوران، روشنی کی توانائی کو قید کیا جاتا ہے اور پانی، کاربن ڈائی آکسائیڈ، اور معدنیات کو آکسیجن اور توانائی سے بھرپور نامیاتی مرکبات جیسے گلوکوز میں تبدیل کرنے کے لیے استعمال کیا جاتا ہے۔',
        examples: ['Input: Water, CO2. Output: Oxygen, Glucose.'], keywords: ['carbon dioxide', 'oxygen', 'water', 'glucose']
    },
    // Pakistan Studies Grade 5: Independence
    {
        subject: 'Pakistan Studies', grade: 5, board: 'Punjab', chapter: 1, chapterName: 'The Struggle for Independence', topic: 'The Pakistan Movement',
        content: 'The Pakistan Movement was a political movement in the first half of the 20th century that aimed for the creation of an independent Muslim-majority state, Pakistan, from British India.',
        urduContent: 'تحریک پاکستان 20ویں صدی کے پہلے نصف میں ایک سیاسی تحریک تھی جس کا مقصد برطانوی ہندوستان سے ایک آزاد مسلم اکثریتی ریاست، پاکستان کا قیام تھا۔',
        examples: ['Led by figures like Allama Iqbal and Muhammad Ali Jinnah.'], keywords: ['Pakistan Movement', 'independence', 'Jinnah']
    },
    {
        subject: 'Pakistan Studies', grade: 5, board: 'Punjab', chapter: 1, chapterName: 'The Struggle for Independence', topic: 'Independence Day',
        content: 'Pakistan achieved independence and was declared a sovereign state on 14 August 1947. This day is celebrated annually as Independence Day.',
        urduContent: 'پاکستان نے 14 اگست 1947 کو آزادی حاصل کی اور ایک خودمختار ریاست قرار پایا۔ اس دن کو ہر سال یوم آزادی کے طور پر منایا جاتا ہے۔',
        examples: ['Parades, flag-hoisting ceremonies.'], keywords: ['14 August 1947', 'Independence Day', 'sovereign state']
    },
    // English Grade 3: Grammar
    {
        subject: 'English', grade: 3, board: 'Federal', chapter: 2, chapterName: 'Grammar Basics', topic: 'Nouns',
        content: 'A noun is a word that names a person, place, thing, or idea. Nouns can be common (like ‘city’) or proper (like ‘Lahore’).',
        urduContent: 'اسم وہ لفظ ہے جو کسی شخص، جگہ، چیز یا خیال کا نام ہو۔ اسم عام (جیسے ‘شہر’) یا خاص (جیسے ‘لاہور’) ہو سکتے ہیں۔',
        examples: ['Person: boy, Place: school, Thing: book, Idea: love'], keywords: ['noun', 'person', 'place', 'thing', 'idea']
    },
    {
        subject: 'English', grade: 3, board: 'Federal', chapter: 2, chapterName: 'Grammar Basics', topic: 'Verbs',
        content: 'A verb is a word that shows an action or a state of being. Every sentence needs a verb.',
        urduContent: 'فعل وہ لفظ ہے جو کسی عمل یا ہونے کی حالت کو ظاہر करता ہے۔ ہر جملے میں ایک فعل کی ضرورت ہوتی ہے۔',
        examples: ['Action: run, jump, read. State of being: is, are, was.'], keywords: ['verb', 'action', 'state of being']
    }
];

// In-memory store for our embeddings
let embeddedKnowledgeBase: (CurriculumContent & { id: string, createdAt: string })[] | null = null;

// Function to generate embeddings for our mock data
async function getEmbeddedKnowledge(): Promise<(CurriculumContent & { id: string; createdAt: string; })[]> {
    if (embeddedKnowledgeBase) {
        return embeddedKnowledgeBase;
    }

    console.log("Creating embeddings for the knowledge base...");
    const tempKb = await Promise.all(
        knowledgeBase.map(async (doc, index) => {
            const { embedding } = await generateEmbedding({ text: doc.content });
            return {
                ...doc,
                id: `mock-${index}`,
                createdAt: new Date().toISOString(),
                embedding: embedding,
            };
        })
    );
    embeddedKnowledgeBase = tempKb;
    console.log("Embeddings created successfully.");
    return embeddedKnowledgeBase;
}

// Simple cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

type ScoredChunk = CurriculumContent & {
    id: string;
    createdAt: string;
    score: number;
};

// Simple retrieval based on cosine similarity
export const retrieveChunks = async (query: string, topK: number = 3): Promise<ScoredChunk[]> => {
    // Ensure the knowledge base is embedded on first run
    const knowledge = await getEmbeddedKnowledge();
    const { embedding: queryEmbedding } = await generateEmbedding({ text: query });

    if (!queryEmbedding) {
        console.error("Failed to generate query embedding.");
        return [];
    }

    const scoredChunks = knowledge.map(doc => {
        if (!doc.embedding) {
            console.warn(`Document ${doc.id} is missing an embedding.`);
            return { ...doc, score: 0 };
        }
        return {
            ...doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
        };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
};
