# Templates Directory

## Template File Location

Place your Excel template file here with the name: **`template.xlsx`**

### File Path:
```
sales-api/templates/template.xlsx
```

### Template Requirements:
- The file must be in Excel format (.xlsx)
- The file should contain your desired template structure
- The system will map data from uploaded files to this template based on company-specific column mappings

### Company Mappings:
Each company has specific column mappings defined in the ExcelService:
- **Company A**: Maps columns A→A, B→B, C→C, D→D, E→E (starting from row 2)
- **Company B**: Maps columns B→A, C→B, D→C, E→D, F→E (starting from row 3)
- **Company C**: Maps columns C→A, A→B, B→C, D→D, E→E (starting from row 2)
- **Company D**: Maps columns A→A, D→B, B→C, C→D, E→E (starting from row 4)
- **Company E**: Maps columns E→A, D→B, C→C, B→D, A→E (starting from row 2)

### How it works:
1. User uploads an Excel file with data
2. System reads your template.xlsx file
3. Based on the selected company, data is mapped from the uploaded file to your template
4. User gets a processed file with their data formatted according to your template

### Note:
Make sure your template.xlsx file is properly formatted and contains all the necessary headers and structure you want in the final output.