import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NextFunction } from "express";

@Schema({
    timestamps: {
        createdAt: 'created_at',
    },
    toJSON: {
        getters: true,
        virtuals: true,
    },
})

export class Otp {
    @Prop()
    phone_number: string;
    
    @Prop({
        required: true,
        match: /^[0-9]+$/,
    })
    otp: string;

    @Prop({
        default: () => new Date(Date.now() + 5 * 60 * 1000),
        index: { expireAfterSeconds: 0 },
    })
    expired_date: Date
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

export const OtpSchemaFactory = () => {
    const otp_schema = OtpSchema;

    otp_schema.pre('findOneAndDelete', async function (next: NextFunction) {
        // OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
        const organization = await this.model.findOne(this.getFilter());
        await Promise.all([]);
        return next();
    });
    return otp_schema;
};
