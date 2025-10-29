import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { auditFieldsPlugin } from 'src/plugins/audit-fields.plugin';
import { ImpactLevel } from 'src/enums/impact-level.enum';
import { CurrentSituation } from 'src/enums/current-situation.enum';

export type ReportDocument = HydratedDocument<Report>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Report extends BaseEntity {
  @Prop({ required: false })
  victimName?: string;

  @Prop({ required: true })
  classGrade: string;

  @Prop({ required: false })
  gender?: string;

  @Prop({ required: false })
  relationshipToVictim?: string;

  @Prop({ required: false })
  relationshipOther?: string;

  @Prop({ type: [String], required: false, default: [] })
  violenceTypes: string[];

  @Prop({ required: false })
  violenceOther?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  locationOther?: string;

  @Prop({ required: false })
  timeOfIncident?: string;

  @Prop({ required: false, enum: ImpactLevel })
  impactLevel?: ImpactLevel;

  @Prop({ required: false, enum: CurrentSituation })
  currentSituation?: CurrentSituation;

  @Prop({ type: [String], required: false, default: [] })
  informationSources: string[];

  @Prop({ required: false })
  informationReliability?: string;

  @Prop({ required: false })
  contactInfo?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 4 })
  alertLevel: number;

  @Prop({ required: false, default: false })
  hasEvidence: boolean;

  @Prop({ required: false })
  evidenceUrl?: string[];

  @Prop({ required: false, default: 'Pending' })
  status: string;

  @Prop({ required: false })
  additional_details?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.plugin(auditFieldsPlugin);
