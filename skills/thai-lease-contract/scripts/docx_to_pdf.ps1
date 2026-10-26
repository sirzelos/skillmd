# Convert a .docx to .pdf with Microsoft Word (Windows). Usage: powershell -File docx_to_pdf.ps1 in.docx [out.pdf]
param([Parameter(Mandatory = $true)][string]$InFile, [string]$OutFile)
$in = (Resolve-Path $InFile).Path
if (-not $OutFile) { $OutFile = [System.IO.Path]::ChangeExtension($in, '.pdf') }
$out = [System.IO.Path]::GetFullPath($OutFile)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($in, $false, $true)
    $doc.ExportAsFixedFormat($out, 17)   # 17 = wdExportFormatPDF
    "pages: " + $doc.ComputeStatistics(2)  # 2 = wdStatisticPages
    $doc.Close($false)
    "wrote $out"
} finally {
    $word.Quit()
}
