# ============================================================
#  Máy chủ web tĩnh tối giản bằng PowerShell (không cần admin)
#  Phục vụ các file trong thư mục chứa script này.
#  Mở trình duyệt tại địa chỉ được in ra bên dưới.
# ============================================================
[CmdletBinding()]
param(
    [int]$Port = 8080
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ánh xạ phần mở rộng file -> Content-Type
$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".txt"  = "text/plain; charset=utf-8"
    ".md"   = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "=========================================="
Write-Host " Dang phuc vu tai:  http://localhost:$Port/"
Write-Host " Thu muc:           $root"
Write-Host " Nhan Ctrl+C de dung may chu."
Write-Host "=========================================="

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $client.NoDelay = $true
        try {
            $stream = $client.GetStream()
            $buffer = New-Object byte[] 8192

            # Đọc dòng yêu cầu đầu tiên (request line)
            $requestLine = ""
            while ($true) {
                $read = $stream.Read($buffer, 0, $buffer.Length)
                if ($read -le 0) { break }
                $chunk = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
                $requestLine += $chunk
                if ($requestLine -match "`r?`n`r?`n" -or $requestLine -match "`n") { break }
                if ($requestLine.Length -gt 65536) { break }
            }

            if ([string]::IsNullOrWhiteSpace($requestLine)) { $client.Close(); continue }

            $parts = $requestLine -split "`r?`n" | Select-Object -First 1
            $tokens = $parts -split "\s+"
            $method = $tokens[0]
            $target = if ($tokens.Count -ge 2) { $tokens[1] } else { "/" }

            if ($method -ne "GET" -and $method -ne "HEAD") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("405 Method Not Allowed")
                $head = "HTTP/1.1 405 Method Not Allowed`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)
                $stream.Write($body, 0, $body.Length)
                $client.Close(); continue
            }

            # Tách đường dẫn khỏi query string và giải mã URL
            $path = $target
            $qIndex = $path.IndexOf("?")
            if ($qIndex -ge 0) { $path = $path.Substring(0, $qIndex) }
            $path = [System.Uri]::UnescapeDataString($path)
            if ($path -eq "/" ) { $path = "/index.html" }

            # Chống path traversal
            $relative = $path.TrimStart("/") -replace "/", "\"
            $fullPath = Join-Path $root $relative
            $fullResolved = [System.IO.Path]::GetFullPath($fullPath)
            if (-not $fullResolved.StartsWith([System.IO.Path]::GetFullPath($root), [System.StringComparison]::OrdinalIgnoreCase)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
                $head = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)
                $stream.Write($body, 0, $body.Length)
                $client.Close(); continue
            }

            if (-not (Test-Path $fullResolved -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $head = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nContent-Type: text/plain; charset=utf-8`r`nConnection: close`r`n`r`n"
                $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)
                $stream.Write($body, 0, $body.Length)
                $client.Close(); continue
            }

            $ext = [System.IO.Path]::GetExtension($fullResolved).ToLower()
            $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($fullResolved)

            $head = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)

            if ($method -eq "GET") {
                $stream.Write($bytes, 0, $bytes.Length)
            }
            $stream.Flush()
        }
        catch {
            # Bỏ qua lỗi từng request để server không bị gián đoạn
        }
        finally {
            try { $client.Close() } catch {}
        }
    }
}
finally {
    $listener.Stop()
    Write-Host "May chu da dung."
}
