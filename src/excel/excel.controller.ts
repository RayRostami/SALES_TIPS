import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientName') clientName: string,
    @Body('companyId') companyId: string,
    @Body('ado') ado: string,
    @Body('loanRate') loanRate: string,
    @Body('corporateTaxRate') corporateTaxRate: string,
    @Body('personalTaxRate') personalTaxRate: string,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (
      !clientName ||
      !companyId ||
      !ado ||
      !loanRate ||
      !corporateTaxRate ||
      !personalTaxRate
    ) {
      throw new BadRequestException('All fields are required');
    }

    try {
      const processedBuffer = await this.excelService.processExcel(
        file.buffer,
        clientName,
        parseInt(companyId),
        parseFloat(ado),
        parseFloat(loanRate),
        parseFloat(corporateTaxRate),
        parseFloat(personalTaxRate),
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${clientName}_processed.xlsx"`,
      );

      return res.send(processedBuffer);
    } catch (error) {
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }
}
