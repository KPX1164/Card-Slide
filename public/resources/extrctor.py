import pandas as pd

# Read the Excel file
excel_file = pd.ExcelFile('ASL-Template.xlsx')

# Create Loop through each sheet and save as CSV
for sheet_name in excel_file.sheet_names:
    df = excel_file.parse(sheet_name)
    df.to_csv(f'{sheet_name}.csv', index=False)     