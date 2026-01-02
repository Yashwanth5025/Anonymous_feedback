import mongoose, { Schema, Document } from 'mongoose'

export interface IResponse extends Document {
  formId: string
  answers: Record<string, string>
  submittedAt: Date
}

const ResponseSchema = new Schema<IResponse>(
  {
    formId: { type: String, required: true, index: true },
    answers: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema)

