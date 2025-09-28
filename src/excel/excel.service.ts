import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

interface CompanyMapping {
  id: number;
  name: string;
  sourceStartingRow: number;
  templateStartingRow: number;
  clientNameCell?: string;
  adoCell?: string;
  loanRateCell?: string;
  corporateTaxRateCell?: string;
  personalTaxRateCell?: string;
  columnMappings: {
    templateColumn: string;
    sourceColumn: string;
  }[];
}

@Injectable()
export class ExcelService {
  private readonly companyMappings: CompanyMapping[] = [
    {
      id: 1,
      name: 'ManuLife',
      sourceStartingRow: 2,
      templateStartingRow: 12,
      clientNameCell: 'B1',
      adoCell: 'B9',
      loanRateCell: 'O6',
      corporateTaxRateCell: 'O7',
      personalTaxRateCell: 'O8',
      columnMappings: [
        { templateColumn: 'A', sourceColumn: 'A' },
        { templateColumn: 'B', sourceColumn: 'B' },
        { templateColumn: 'C', sourceColumn: 'D' },
        { templateColumn: 'D', sourceColumn: 'H' },
        { templateColumn: 'E', sourceColumn: 'I' },
        { templateColumn: 'F', sourceColumn: 'R' },
        { templateColumn: 'G', sourceColumn: 'T' },
        { templateColumn: 'I', sourceColumn: 'X' },
        { templateColumn: 'J', sourceColumn: 'AE' },
        { templateColumn: 'K', sourceColumn: 'AF' },
      ],
    },
    {
      id: 2,
      name: 'Sunlife',
      sourceStartingRow: 2,
      templateStartingRow: 12,
      clientNameCell: 'B1',
      adoCell: 'B9',
      loanRateCell: 'O6',
      corporateTaxRateCell: 'O7',
      personalTaxRateCell: 'O8',
      columnMappings: [
        { templateColumn: 'A', sourceColumn: 'A' },
        { templateColumn: 'B', sourceColumn: 'B' },
        { templateColumn: 'C', sourceColumn: 'AO' },
        { templateColumn: 'D', sourceColumn: 'J' },
        { templateColumn: 'E', sourceColumn: 'K' },
        { templateColumn: 'F', sourceColumn: 'BL' },
        { templateColumn: 'G', sourceColumn: 'BR' },
        { templateColumn: 'I', sourceColumn: 'L' },
        { templateColumn: 'J', sourceColumn: 'BM' },
        { templateColumn: 'K', sourceColumn: 'BS' },
      ],
    },
    {
      id: 3,
      name: 'Canada Life',
      sourceStartingRow: 2,
      templateStartingRow: 12,
      clientNameCell: 'B1',
      adoCell: 'B9',
      loanRateCell: 'O6',
      corporateTaxRateCell: 'O7',
      personalTaxRateCell: 'O8',
      columnMappings: [
        { templateColumn: 'A', sourceColumn: 'A' },
        { templateColumn: 'B', sourceColumn: 'B' },
        { templateColumn: 'C', sourceColumn: 'B' },
        { templateColumn: 'D', sourceColumn: 'K' },
        { templateColumn: 'E', sourceColumn: 'H' },
        { templateColumn: 'F', sourceColumn: 'N' },
        { templateColumn: 'G', sourceColumn: 'P' },
        { templateColumn: 'I', sourceColumn: 'AQ' },
        { templateColumn: 'J', sourceColumn: 'AU' },
        { templateColumn: 'K', sourceColumn: 'AW' },
      ],
    },
    {
      id: 4,
      name: 'Equitable',
      sourceStartingRow: 2,
      templateStartingRow: 12,
      clientNameCell: 'B1',
      adoCell: 'B9',
      loanRateCell: 'O6',
      corporateTaxRateCell: 'O7',
      personalTaxRateCell: 'O8',
      columnMappings: [
        { templateColumn: 'A', sourceColumn: 'A' },
        { templateColumn: 'B', sourceColumn: 'B' },
        { templateColumn: 'C', sourceColumn: 'E' },
        { templateColumn: 'D', sourceColumn: 'Q' },
        { templateColumn: 'E', sourceColumn: 'N' },
        { templateColumn: 'F', sourceColumn: 'AF' },
        { templateColumn: 'G', sourceColumn: 'T' },
        { templateColumn: 'I', sourceColumn: 'O' },
        { templateColumn: 'J', sourceColumn: 'AG' },
        { templateColumn: 'K', sourceColumn: 'U' },
      ],
    },
    {
      id: 5,
      name: 'Sunlife',
      sourceStartingRow: 2,
      templateStartingRow: 12,
      clientNameCell: 'B1',
      adoCell: 'B9',
      loanRateCell: 'O6',
      corporateTaxRateCell: 'O7',
      personalTaxRateCell: 'O8',
      columnMappings: [
        { templateColumn: 'A', sourceColumn: 'A' },
        { templateColumn: 'B', sourceColumn: 'B' },
        { templateColumn: 'C', sourceColumn: 'AO' },
        { templateColumn: 'D', sourceColumn: 'J' },
        { templateColumn: 'E', sourceColumn: 'K' },
        { templateColumn: 'F', sourceColumn: 'BL' },
        { templateColumn: 'G', sourceColumn: 'BR' },
        { templateColumn: 'I', sourceColumn: 'L' },
        { templateColumn: 'J', sourceColumn: 'BM' },
        { templateColumn: 'K', sourceColumn: 'BS' },
      ],
    },
  ];

  async processExcel(
    uploadedFileBuffer: Buffer,
    clientName: string,
    companyId: number,
    ado: number,
    loanRate: number,
    corporateTaxRate: number,
    personalTaxRate: number,
  ): Promise<Buffer> {
    const mapping = this.companyMappings.find((m) => m.id === companyId);
    if (!mapping) {
      throw new Error('Invalid company mapping');
    }

    // Read uploaded file
    const uploadedWorkbook = new ExcelJS.Workbook();
    await uploadedWorkbook.xlsx.load(uploadedFileBuffer);
    const uploadedSheet = uploadedWorkbook.getWorksheet(1); // 1-based index for first sheet
    if (!uploadedSheet) {
      throw new Error('No worksheet found in uploaded file');
    }

    // Read template file
    const templatePath = path.join(process.cwd(), 'templates', 'template.xlsx');
    const templateWorkbook = new ExcelJS.Workbook();
    await templateWorkbook.xlsx.readFile(templatePath);
    const templateSheet = templateWorkbook.getWorksheet(1); // 1-based index for first sheet
    if (!templateSheet) {
      throw new Error('No worksheet found in template file');
    }

    // Add client name to the specified cell if defined in mapping
    if (mapping.clientNameCell) {
      const cell = templateSheet.getCell(mapping.clientNameCell);
      cell.value = clientName;
    }
    if (mapping.adoCell) {
      const cell = templateSheet.getCell(mapping.adoCell);
      cell.value = ado;
    }
    if (mapping.loanRateCell) {
      const cell = templateSheet.getCell(mapping.loanRateCell);
      cell.value = loanRate / 100;
    }
    if (mapping.corporateTaxRateCell) {
      const cell = templateSheet.getCell(mapping.corporateTaxRateCell);
      cell.value = corporateTaxRate / 100;
    }
    if (mapping.personalTaxRateCell) {
      const cell = templateSheet.getCell(mapping.personalTaxRateCell);
      cell.value = personalTaxRate / 100;
    }
    // Process data mapping
    uploadedSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= mapping.sourceStartingRow) {
        const templateRowIndex = rowNumber - mapping.sourceStartingRow + mapping.templateStartingRow;
        
        mapping.columnMappings.forEach((colMapping) => {
          const sourceColIndex = this.columnToIndex(colMapping.sourceColumn) + 1; // ExcelJS is 1-based
          const value = row.getCell(sourceColIndex).value;
          
          if (value !== null && value !== undefined && value !== '') {
            const templateCell = templateSheet.getCell(`${colMapping.templateColumn}${templateRowIndex}`);
            templateCell.value = value;
          }
        });
      }
    });

    // Force recalculation of all formulas
    templateWorkbook.calcProperties.fullCalcOnLoad = true;
    


    return await templateWorkbook.xlsx.writeBuffer() as Buffer;
  }

  private columnToIndex(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 64);
    }
    return result - 1; // Convert to 0-based index
  }

  getCompanyMappings(): CompanyMapping[] {
    return this.companyMappings;
  }
}
