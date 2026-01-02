import mongoose, { Schema, Document } from 'mongoose'

export interface IAccessToken extends Document {
  formId: string
  email: string
  uid: string
  used: boolean
  usedAt?: Date
  createdAt: Date
}

const AccessTokenSchema = new Schema<IAccessToken>(
  {
    formId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    uid: { type: String, required: true, unique: true, index: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.AccessToken || mongoose.model<IAccessToken>('AccessToken', AccessTokenSchema)

