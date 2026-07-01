#!/usr/bin/env bash
# --------------------------------------------------------------
# Script: push_with_pat.sh
# Objetivo: inicializar um repositório Git, criar o remoto
#           e enviar todo o conteúdo ao GitHub usando o PAT
# --------------------------------------------------------------

# ---- CONFIGURAÇÃO -------------------------------------------------
# Substitua caso queira outro nome de repositório ou proprietário
REPO_OWNER="matheusandre2207-hub"
REPO_NAME="flat-mock-os"

# Seu token de acesso pessoal (PAT) – **NÃO compartilhe**
PAT="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"

# URL do repositório (HTTPS) – o token será injetado na URL
REMOTE_URL="https://${PAT}@github.com/${REPO_OWNER}/${REPO_NAME}.git"
# -------------------------------------------------------------------

set -e   # aborta se algum comando falhar

# 1️⃣  Inicializa o repositório (se ainda não existir)
if [ ! -d ".git" ]; then
  echo "Inicializando repositório Git..."
  git init
else
  echo "Repositório já inicializado."
fi

# 2️⃣  Configura o remote (sobrescreve caso já exista)
if git remote | grep -q "^origin$"; then
  echo "Atualizando URL do remote 'origin'..."
  git remote set-url origin "$REMOTE_URL"
else
  echo "Adicionando remote 'origin'..."
  git remote add origin "$REMOTE_URL"
fi

# 3️⃣  Adiciona todos os arquivos
git add .

# 4️⃣  Commit (apenas se houver mudanças)
if git status --porcelain | grep .; then
  echo "Criando commit inicial..."
  git commit -m "Initial commit – mock‑OS project (uploaded via PAT script)"
else
  echo "Nenhuma alteração para commitar."
fi

# 5️⃣  Descobre o branch atual (ou cria 'main' caso ainda não exista)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
echo "Branch atual: $CURRENT_BRANCH"

# 6️⃣  Envia para o GitHub (cria o branch remoto se necessário)
echo "Enviando para o GitHub..."
git push -u origin "$CURRENT_BRANCH"

echo "✅  Push concluído com sucesso!"