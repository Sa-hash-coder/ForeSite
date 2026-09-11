// ─── ForeSite Client-Side Data Export Utilities ────────────────────────────────

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

function escapeCSVCell(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportToCSV<T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
) {
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const headers = columns.map(c => c.header);
  const rows = data.map(item => columns.map(c => c.accessor(item)));

  const csvContent =
    '\uFEFF' +
    [
      headers.map(escapeCSVCell).join(','),
      ...rows.map(row => row.map(escapeCSVCell).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, cleanFilename);
}

function escapeXML(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportToExcel<T>(
  filename: string,
  sheetName: string,
  columns: ExportColumn<T>[],
  data: T[]
) {
  const cleanFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  const headers = columns.map(c => c.header);
  const rows = data.map(item => columns.map(c => c.accessor(item)));

  const headerCells = headers
    .map(h => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`)
    .join('');

  const dataRows = rows
    .map(row => {
      const cells = row
        .map(cell => {
          const isNum = typeof cell === 'number';
          const type = isNum ? 'Number' : 'String';
          return `<Cell ss:StyleID="DataRow"><Data ss:Type="${type}">${escapeXML(cell)}</Data></Cell>`;
        })
        .join('');
      return `<Row ss:Height="22">${cells}</Row>`;
    })
    .join('\n   ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataRow">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXML(sheetName)}">
  <Table ss:DefaultColumnWidth="130" ss:DefaultRowHeight="22">
   <Row ss:Height="26">
    ${headerCells}
   </Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, cleanFilename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}