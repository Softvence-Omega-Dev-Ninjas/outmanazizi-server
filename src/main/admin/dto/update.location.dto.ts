import { PartialType } from "@nestjs/swagger";
import { CreateAreaDto } from "./areaAndServices.dto";

export class UpdateLocationDto extends PartialType(CreateAreaDto) { }