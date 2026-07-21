# Tiny static file server for local PWA testing.
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Stop:   Ctrl+C   (or kill the powershell process)

$port = 8080
if ($env:PORT) { $port = [int]$env:PORT }
$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

$mime = @{
  '.html'         = 'text/html; charset=utf-8'
  '.htm'          = 'text/html; charset=utf-8'
  '.js'           = 'application/javascript; charset=utf-8'
  '.mjs'          = 'application/javascript; charset=utf-8'
  '.json'         = 'application/json; charset=utf-8'
  '.webmanifest'  = 'application/manifest+json; charset=utf-8'
  '.css'          = 'text/css; charset=utf-8'
  '.svg'          = 'image/svg+xml'
  '.png'          = 'image/png'
  '.jpg'          = 'image/jpeg'
  '.jpeg'         = 'image/jpeg'
  '.ico'          = 'image/x-icon'
  '.woff'         = 'font/woff'
  '.woff2'        = 'font/woff2'
  '.txt'          = 'text/plain; charset=utf-8'
  '.md'           = 'text/markdown; charset=utf-8'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try { $listener.Start() }
catch {
  Write-Host "Could not bind to port $port. Is something else using it?" -ForegroundColor Red
  Write-Host $_
  exit 1
}

Write-Host ""
Write-Host "  Calendar For Life - local dev server" -ForegroundColor Yellow
Write-Host "  ===================================="   -ForegroundColor Yellow
Write-Host "  Root:  $root"
Write-Host "  URL:   http://localhost:$port/"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { break }

  $req = $ctx.Request
  $res = $ctx.Response

  $relRaw = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
  if ($relRaw -eq '/' -or $relRaw -eq '') { $relRaw = '/index.html' }
  $rel = $relRaw.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
  $path = Join-Path $root $rel

  $full = $null
  try { $full = (Resolve-Path -LiteralPath $path -ErrorAction Stop).Path } catch { $full = $null }

  $status = 200
  $bytes  = $null
  $ctype  = 'application/octet-stream'

  if (-not $full -or -not $full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
    $status = 404
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
    $ctype = 'text/plain; charset=utf-8'
  } else {
    $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
    if ($mime.ContainsKey($ext)) { $ctype = $mime[$ext] }
    $bytes = [System.IO.File]::ReadAllBytes($full)
  }

  $res.StatusCode      = $status
  $res.ContentType     = $ctype
  $res.ContentLength64 = $bytes.Length
  $res.Headers.Add('Cache-Control', 'no-store')
  $res.Headers.Add('Service-Worker-Allowed', '/')
  try {
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {}
  $res.OutputStream.Close()

  $tag = if ($status -eq 200) { 'OK ' } else { '   ' }
  $msg = '  ' + $tag + ' ' + $status + '  ' + $relRaw
  Write-Host $msg
}

$listener.Stop()
