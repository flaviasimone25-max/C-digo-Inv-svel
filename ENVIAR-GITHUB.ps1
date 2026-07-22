# Execute após instalar Git: https://git-scm.com/download/win
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

git init
git branch -M main
git add .
git commit -m "Publicar landing Código Invisível pronta para Vercel."
git remote remove origin 2>$null
git remote add origin https://github.com/flaviasimone25-max/C-digo-Inv-svel.git
git push -u origin main

Write-Host "Repositório publicado com sucesso."
