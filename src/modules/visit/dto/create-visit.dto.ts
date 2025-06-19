import { IsNotEmpty } from "class-validator";

export class CreateVisitDto {
    @IsNotEmpty({message: 'ipAddress không được để trống'})
    ipAddress: string;
}
