param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Path,

  [string]$Title = "",
  [string]$Category = "随笔",
  [string[]]$Tags = @(),
  [switch]$Overwrite,
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error $Message
  exit 1
}

function Get-Tool($Name, $Fallback) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  return $Fallback
}

function Convert-ToSlug($Value) {
  $slug = $Value.Trim().ToLowerInvariant()
  $slug = $slug -replace '[\\/:*?"<>|#%&{}$!''@+`=]', ''
  $slug = $slug -replace '\s+', '-'
  $slug = $slug -replace '-+', '-'
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return (Get-Date -Format "yyyyMMdd-HHmmss")
  }
  return $slug
}

function HasFrontMatter($Content) {
  return $Content -match '^\s*---\r?\n'
}

function Get-FrontMatterTitle($Content) {
  $match = [regex]::Match($Content, '(?m)^title:\s*(.+?)\s*$')
  if ($match.Success) {
    return $match.Groups[1].Value.Trim().Trim('"').Trim("'")
  }
  return ""
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$safeRepoRoot = $repoRoot -replace '\\', '/'
$postsDir = Join-Path $repoRoot "source\_posts"
$sourcePath = Resolve-Path -LiteralPath $Path -ErrorAction Stop
$extension = [System.IO.Path]::GetExtension($sourcePath).ToLowerInvariant()

if ($extension -notin @(".md", ".markdown")) {
  Fail "目前脚本只支持 Markdown 文件：.md 或 .markdown。"
}

Set-Location $repoRoot

$git = Get-Tool "git.exe" "git"
$npm = Get-Tool "npm.cmd" "npm"

$raw = Get-Content -LiteralPath $sourcePath -Raw -Encoding UTF8
$postTitle = $Title.Trim()

if ([string]::IsNullOrWhiteSpace($postTitle) -and (HasFrontMatter $raw)) {
  $postTitle = Get-FrontMatterTitle $raw
}

if ([string]::IsNullOrWhiteSpace($postTitle)) {
  $postTitle = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath)
}

$slug = Convert-ToSlug $postTitle
$targetPath = Join-Path $postsDir "$slug.md"

if ((Test-Path -LiteralPath $targetPath) -and -not $Overwrite) {
  Fail "文章已存在：$targetPath。确认要覆盖时加参数 -Overwrite。"
}

if (HasFrontMatter $raw) {
  $output = $raw
} else {
  $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $tagLines = ""
  foreach ($tag in $Tags) {
    if (-not [string]::IsNullOrWhiteSpace($tag)) {
      $tagLines += "  - $tag`n"
    }
  }
  if ([string]::IsNullOrWhiteSpace($tagLines)) {
    $tagLines = "  - 记录`n"
  }

  $output = @"
---
title: $postTitle
date: $now
categories:
  - $Category
tags:
${tagLines}cover: /assets/cover-notes.svg
---

$raw
"@
}

New-Item -ItemType Directory -Force -Path $postsDir | Out-Null
Set-Content -LiteralPath $targetPath -Value $output -Encoding UTF8

Write-Host "文章已准备：" $targetPath
Write-Host "正在构建 Hexo..."
& $npm run build
if ($LASTEXITCODE -ne 0) {
  Fail "Hexo 构建失败，已停止发布。"
}

Write-Host "正在提交到 Git..."
& $git -c "safe.directory=$safeRepoRoot" add source/_posts
$status = & $git -c "safe.directory=$safeRepoRoot" status --short

if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "没有检测到需要提交的新文章。"
  exit 0
}

& $git -c "safe.directory=$safeRepoRoot" commit -m "Add post: $postTitle"
if ($LASTEXITCODE -ne 0) {
  Fail "Git 提交失败，已停止发布。"
}

if ($NoPush) {
  Write-Host "已提交，按 -NoPush 要求跳过推送。"
  exit 0
}

Write-Host "正在推送到 GitHub..."
& $git -c "safe.directory=$safeRepoRoot" push
if ($LASTEXITCODE -ne 0) {
  Fail "Git 推送失败。请检查网络或 GitHub 登录状态。"
}

Write-Host "发布完成。GitHub Actions 会自动部署到 https://1angyyshuo.github.io"
