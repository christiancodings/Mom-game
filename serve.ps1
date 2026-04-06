param(
  [int]$Port = 5500,
  [string]$Root = "."
)

$rootPath = (Resolve-Path $Root).Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.IgnoreWriteExceptions = $true
$listener.Start()
Write-Host "Serving $rootPath at http://localhost:$Port/"

$mimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif" = "image/gif"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
  ".txt" = "text/plain; charset=utf-8"
  ".mp3" = "audio/mpeg"
}

try {
  while ($listener.IsListening) {
    $context = $null
    try {
      $context = $listener.GetContext()
      $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }

      $filePath = Join-Path $rootPath $requestPath
      if ((Test-Path $filePath) -and (Get-Item $filePath).PSIsContainer) {
        $filePath = Join-Path $filePath "index.html"
      }

      if (Test-Path $filePath) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $contentType = $mimeMap[$ext]
        if (-not $contentType) {
          $contentType = "application/octet-stream"
        }

        $fileInfo = Get-Item $filePath
        $context.Response.StatusCode = 200
        $context.Response.ContentType = $contentType
        $context.Response.KeepAlive = $false
        $context.Response.SendChunked = $false
        $context.Response.ContentLength64 = $fileInfo.Length
        $fileStream = [System.IO.File]::OpenRead($filePath)
        try {
          $fileStream.CopyTo($context.Response.OutputStream)
        }
        finally {
          $fileStream.Close()
        }
      }
      else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $context.Response.StatusCode = 404
        $context.Response.ContentType = "text/plain; charset=utf-8"
        $context.Response.KeepAlive = $false
        $context.Response.SendChunked = $false
        $context.Response.ContentLength64 = $body.Length
        $context.Response.OutputStream.Write($body, 0, $body.Length)
      }
    }
    catch [System.Net.HttpListenerException] {
      if ($_.Exception.ErrorCode -ne 995) {
        Write-Warning "HttpListener request failed: $($_.Exception.Message)"
      }
    }
    catch {
      Write-Warning "Request handling error: $($_.Exception.Message)"
    }
    finally {
      if ($context -and $context.Response) {
        try {
          $context.Response.Close()
        }
        catch {
        }
      }
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
