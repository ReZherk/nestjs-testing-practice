import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: string) {
    if (typeof value !== 'string') {
      throw new BadRequestException('UppercasePipe expects a string value');
    }
    return value.toUpperCase();
  }
}
