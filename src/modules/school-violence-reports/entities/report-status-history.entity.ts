import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { auditFieldsPlugin } from 'src/plugins/audit-fields.plugin';

export type ReportStatusHistoryDocument = HydratedDocument<ReportStatusHistory>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class ReportStatusHistory extends BaseEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true })
  reportId: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
  oldStatus?: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  changedBy?: mongoose.Types.ObjectId;

  @Prop({ required: false })
  note?: string;

  @Prop({ required: false })
  changedAt: Date;
}

export const ReportStatusHistorySchema = SchemaFactory.createForClass(ReportStatusHistory);

ReportStatusHistorySchema.plugin(auditFieldsPlugin);
