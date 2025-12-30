"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type QuestionType = "mcq" | "text"

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[] // For MCQ questions
}

export interface FeedbackForm {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
}

export interface Response {
  id: string
  formId: string
  answers: Record<string, string> // questionId -> answer
  submittedAt: string
}

interface StoreState {
  forms: FeedbackForm[]
  responses: Response[]
  addForm: (form: Omit<FeedbackForm, "id" | "createdAt">) => void
  addResponse: (response: Omit<Response, "id" | "submittedAt">) => void
  getFormById: (id: string) => FeedbackForm | undefined
  getResponsesByFormId: (formId: string) => Response[]
}

// Initial demo data
const initialForms: FeedbackForm[] = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    description: "Help us improve CS101 by sharing your anonymous feedback",
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "How would you rate the course difficulty?",
        options: ["Too Easy", "Just Right", "Too Difficult", "Very Difficult"],
      },
      {
        id: "q2",
        type: "mcq",
        question: "How engaging were the lectures?",
        options: ["Very Engaging", "Somewhat Engaging", "Neutral", "Not Engaging"],
      },
      {
        id: "q3",
        type: "text",
        question: "What did you like most about this course?",
      },
      {
        id: "q4",
        type: "text",
        question: "What improvements would you suggest?",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Data Structures and Algorithms",
    description: "Share your thoughts on DSA course",
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "How clear were the explanations?",
        options: ["Very Clear", "Clear", "Somewhat Clear", "Unclear"],
      },
      {
        id: "q2",
        type: "text",
        question: "Which topic was most challenging for you?",
      },
    ],
    createdAt: new Date().toISOString(),
  },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      forms: initialForms,
      responses: [],
      addForm: (form) => {
        const newForm: FeedbackForm = {
          ...form,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ forms: [...state.forms, newForm] }))
      },
      addResponse: (response) => {
        const newResponse: Response = {
          ...response,
          id: Date.now().toString(),
          submittedAt: new Date().toISOString(),
        }
        set((state) => ({ responses: [...state.responses, newResponse] }))
      },
      getFormById: (id) => {
        return get().forms.find((form) => form.id === id)
      },
      getResponsesByFormId: (formId) => {
        return get().responses.filter((response) => response.formId === formId)
      },
    }),
    {
      name: "feedback-storage",
    },
  ),
)
