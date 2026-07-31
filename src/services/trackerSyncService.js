/*
 * src/services/trackerSyncService.js
 * Updates the tracker workbook rows for published builds without overwriting the existing sheet structure.
 * Connects to: 286_projects_tracker - with dropdowns.xlsx, reference/286-projects-tracker.xlsx, add-build.js
 * Created: 2026-06-28
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const TRACKER_PRIMARY_FILE = path.join(
  process.cwd(),
  "reference",
  "286-projects-tracker.xlsx",
);
const TRACKER_MIRROR_FILES = [
  path.join(process.cwd(), "286_projects_tracker - with dropdowns.xlsx"),
];

/**
 * Executes a PowerShell script and returns stdout.
 *
 * @param {string} script - The PowerShell script to run.
 * @returns {string} The stdout text.
 */
function runPowerShellScript(script) {
  const result = spawnSync("powershell", ["-NoProfile", "-Command", script], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status !== 0 || result.error) {
    const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
    const stdout = typeof result.stdout === "string" ? result.stdout.trim() : "";
    const processError =
      result.error && result.error.message ? result.error.message : "";

    throw new Error(
      processError || stderr || stdout || "PowerShell script failed.",
    );
  }

  return typeof result.stdout === "string" ? result.stdout.trim() : "";
}

/**
 * Resolves the tracker note text from depth and extra notes.
 *
 * @param {string | undefined} depth - The optional depth label.
 * @param {string | undefined} notes - Optional freeform notes.
 * @returns {string} The tracker note text.
 */
function buildTrackerNote(depth, notes) {
  const noteParts = [];

  if (typeof depth === "string" && depth.trim() !== "") {
    noteParts.push(`Depth: ${depth.trim()}`);
  }

  if (typeof notes === "string" && notes.trim() !== "") {
    noteParts.push(notes.trim());
  }

  return noteParts.join(" | ");
}

/**
 * Returns the tracker workbook paths that currently exist.
 *
 * @returns {string[]} The existing tracker paths.
 */
function getExistingTrackerPaths() {
  return [TRACKER_PRIMARY_FILE, ...TRACKER_MIRROR_FILES].filter((filePath) =>
    fs.existsSync(filePath),
  );
}

/**
 * Returns the canonical tracker workbook path.
 *
 * @returns {string | null} The canonical tracker path if it exists.
 */
function getCanonicalTrackerPath() {
  return fs.existsSync(TRACKER_PRIMARY_FILE) ? TRACKER_PRIMARY_FILE : null;
}

/**
 * Copies the canonical tracker workbook to any mirror locations.
 *
 * @param {string} canonicalPath - The canonical tracker path.
 * @returns {string[]} The mirrored file paths.
 */
function syncTrackerMirrors(canonicalPath) {
  const mirroredPaths = [];

  for (const mirrorPath of TRACKER_MIRROR_FILES) {
    fs.copyFileSync(canonicalPath, mirrorPath);
    mirroredPaths.push(mirrorPath);
  }

  return mirroredPaths;
}

/**
 * Builds the PowerShell payload used to patch tracker workbooks in place.
 *
 * @param {{ build_number: number, date: string, repo_url: string }} buildEntry - The build entry to sync.
 * @param {string} trackerNote - The formatted note text.
 * @param {string} trackerPath - The canonical tracker path to update.
 * @returns {string} The PowerShell script payload.
 */
function createTrackerUpdateScript(buildEntry, trackerNote, trackerPath) {
  const payload = {
    rowNumber: buildEntry.build_number + 1,
    date: buildEntry.date,
    repoUrl: buildEntry.repo_url,
    note: trackerNote,
    trackerPath,
  };

  return `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$payload = @'
${JSON.stringify(payload)}
'@ | ConvertFrom-Json

function Set-InlineCellValue($xmlDoc, $ns, $rowNumber, $columnName, $value) {
  $row = $xmlDoc.SelectSingleNode("//a:sheetData/a:row[@r='$rowNumber']", $ns)
  if (-not $row) { throw "Missing row $rowNumber in tracker workbook." }

  $cellRef = "$columnName$rowNumber"
  $cell = $row.SelectSingleNode("a:c[@r='$cellRef']", $ns)
  if (-not $cell) {
    $cell = $xmlDoc.CreateElement('c', $ns.LookupNamespace('a'))
    $null = $cell.SetAttribute('r', $cellRef)
    $null = $row.AppendChild($cell)
  }

  $null = $cell.RemoveAll()
  $null = $cell.SetAttribute('r', $cellRef)
  $null = $cell.SetAttribute('t', 'inlineStr')

  $isNode = $xmlDoc.CreateElement('is', $ns.LookupNamespace('a'))
  $tNode = $xmlDoc.CreateElement('t', $ns.LookupNamespace('a'))
  if ($value -match '^[\\s]|[\\s]$') {
    $null = $tNode.SetAttribute('xml:space', 'http://www.w3.org/XML/1998/namespace', 'preserve')
  }
  $tNode.InnerText = $value
  $null = $isNode.AppendChild($tNode)
  $null = $cell.AppendChild($isNode)
}

function Update-Workbook($workbookPath, $payload) {
  $tempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
  [System.IO.Directory]::CreateDirectory($tempDir) | Out-Null
  $extractDir = Join-Path $tempDir 'unzipped'
  [System.IO.Directory]::CreateDirectory($extractDir) | Out-Null

  [System.IO.Compression.ZipFile]::ExtractToDirectory($workbookPath, $extractDir)

  $sheetPath = Join-Path $extractDir 'xl\\worksheets\\sheet1.xml'
  [xml]$sheetXml = Get-Content $sheetPath
  $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
  $ns.AddNamespace('a', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')

  Set-InlineCellValue $sheetXml $ns $payload.rowNumber 'E' 'Completed'
  Set-InlineCellValue $sheetXml $ns $payload.rowNumber 'F' $payload.date
  Set-InlineCellValue $sheetXml $ns $payload.rowNumber 'H' $payload.repoUrl
  if ($payload.note) {
    Set-InlineCellValue $sheetXml $ns $payload.rowNumber 'I' $payload.note
  }

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $writer = New-Object System.IO.StreamWriter($sheetPath, $false, $utf8NoBom)
  $sheetXml.Save($writer)
  $writer.Dispose()

  Remove-Item -LiteralPath $workbookPath -Force
  [System.IO.Compression.ZipFile]::CreateFromDirectory($extractDir, $workbookPath)
  Remove-Item -LiteralPath $tempDir -Recurse -Force
}

Update-Workbook $payload.trackerPath $payload
`;
}

/**
 * Builds the PowerShell payload used to read tracker workbook rows.
 *
 * @param {string} trackerPath - The tracker workbook path.
 * @returns {string} The PowerShell script payload.
 */
function createTrackerReadScript(trackerPath) {
  return `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$trackerPath = '${trackerPath.replace(/'/g, "''")}'
$zip = [System.IO.Compression.ZipFile]::OpenRead($trackerPath)
$sheetEntry = $zip.GetEntry('xl\\worksheets\\sheet1.xml')
$sheetReader = New-Object System.IO.StreamReader($sheetEntry.Open())
$content = $sheetReader.ReadToEnd()
$sheetReader.Dispose()
$sharedStrings = @()
$sharedStringsEntry = $zip.GetEntry('xl\\sharedStrings.xml')
if ($sharedStringsEntry) {
  $sharedStringsReader = New-Object System.IO.StreamReader($sharedStringsEntry.Open())
  [xml]$sharedStringsXml = $sharedStringsReader.ReadToEnd()
  $sharedStringsReader.Dispose()
  foreach ($stringItem in $sharedStringsXml.sst.si) {
    if ($stringItem.t) {
      $sharedStrings += [string]$stringItem.t
    } elseif ($stringItem.r) {
      $sharedStrings += (($stringItem.r | ForEach-Object { $_.t }) -join '')
    } else {
      $sharedStrings += ''
    }
  }
}
$zip.Dispose()
[xml]$sheetXml = $content
$ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
$ns.AddNamespace('a', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
$rows = @()
foreach ($row in $sheetXml.SelectNodes('//a:sheetData/a:row[position()>1]', $ns)) {
  $cells = @{}
  foreach ($cell in $row.SelectNodes('a:c', $ns)) {
    $columnName = ($cell.r -replace '\\d', '')
    if ($cell.t -eq 'inlineStr' -and $cell.is -and $cell.is.t) {
      $cells[$columnName] = [string]$cell.is.t
    } elseif ($cell.t -eq 's' -and $cell.v) {
      $cells[$columnName] = $sharedStrings[[int]$cell.v]
    } elseif ($cell.v) {
      $cells[$columnName] = [string]$cell.v
    } else {
      $cells[$columnName] = ''
    }
  }
  if ($cells['E']) {
    $rows += [pscustomobject]@{
      build_number = [int]$cells['A']
      status = $cells['E']
      date = $cells['F']
      repo_url = $cells['H']
      notes = $cells['I']
    }
  }
}
$rows | ConvertTo-Json -Depth 3 -Compress
`;
}

/**
 * Reads the tracker workbook rows from the canonical tracker file.
 *
 * @returns {Array<{build_number: number, status: string, date: string, repo_url: string, notes: string}>} The tracker rows.
 */
function readTrackerRows() {
  const canonicalPath = getCanonicalTrackerPath();

  if (!canonicalPath) {
    return [];
  }

  const stdout = runPowerShellScript(createTrackerReadScript(canonicalPath));

  if (!stdout) {
    return [];
  }

  const parsedRows = JSON.parse(stdout);
  return Array.isArray(parsedRows) ? parsedRows : [parsedRows];
}

/**
 * Updates any tracker workbook copies present in the repo.
 *
 * @param {{ build_number: number, date: string, repo_url: string }} buildEntry - The build entry to sync.
 * @param {{ depth?: string, notes?: string }} options - Optional tracker note data.
 * @returns {string[]} The updated tracker file paths.
 */
function updateTrackerWorkbooks(buildEntry, options = {}) {
  const canonicalPath = getCanonicalTrackerPath();

  if (!canonicalPath) {
    return [];
  }

  const trackerNote = buildTrackerNote(options.depth, options.notes);
  runPowerShellScript(createTrackerUpdateScript(buildEntry, trackerNote, canonicalPath));
  const mirroredPaths = syncTrackerMirrors(canonicalPath);

  return [canonicalPath, ...mirroredPaths];
}

module.exports = {
  buildTrackerNote,
  createTrackerReadScript,
  createTrackerUpdateScript,
  getCanonicalTrackerPath,
  getExistingTrackerPaths,
  readTrackerRows,
  runPowerShellScript,
  syncTrackerMirrors,
  TRACKER_MIRROR_FILES,
  TRACKER_PRIMARY_FILE,
  updateTrackerWorkbooks,
};
