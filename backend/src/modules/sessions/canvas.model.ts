import { Schema, model, Types, Document } from 'mongoose'

export interface CanvasStateDocument extends Document {
  sessionId: Types.ObjectId
  canvasData: object // Fabric.js canvas JSON
  version: number
  lastModifiedBy: Types.ObjectId
  updatedAt: Date
}

const CanvasStateSchema = new Schema<CanvasStateDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    canvasData: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, default: 1 },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

CanvasStateSchema.index({ sessionId: 1 })

export const CanvasStateModel = model<CanvasStateDocument>('CanvasState', CanvasStateSchema)

