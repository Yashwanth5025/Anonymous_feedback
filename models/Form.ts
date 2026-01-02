import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestion {
  id: string
  type: 'mcq' | 'text'
  question: string
  options?: string[]
}

export interface IForm extends Document {
  title: string
  description: string
  questions: IQuestion[]
  type: 'public' | 'private'
  createdAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'text'], required: true },
  question: { type: String, required: true },
  options: { type: [String], required: false },
})

const FormSchema = new Schema<IForm>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema)

