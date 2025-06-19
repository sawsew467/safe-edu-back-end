import { Otp } from "@modules/otp/entities/otp.entity";
import { OtpRepositoryInterface } from "@modules/otp/interface/otp.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";

export class OtpRepository implements OtpRepositoryInterface {
    constructor(
        @InjectModel(Otp.name) private readonly otp_model: Model<Otp>,
    ) {}

     async findOne(condition: FilterQuery<Otp>): Promise<Otp | null> {
            return await this.otp_model.findOne(condition).exec();
        }
    
    async create(createDto: any): Promise<Otp> {
        const newOtp = new this.otp_model(createDto);
        return await newOtp.save();
    }

    async findAll() {
        const Otp = await this.otp_model
            .find()
            .exec(); 
        
        const total = await this.otp_model.countDocuments().exec();
        return { items: Otp, total };
    }

    async update(id: string, data: Partial<Otp>): Promise<Otp | null> {
        return await this.otp_model.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.otp_model.findByIdAndDelete(id).exec();
        return !!result;
    }

    async findById(id: string): Promise<Otp | null> {
        return await this.otp_model.findById(id).exec();
    }
}