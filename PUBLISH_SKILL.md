# Skill: Publicar Biblioteca Angular no NPM

## Objetivo
Publicar automaticamente a biblioteca `@ramonbsales/noah-angular` no npm usando GitHub Actions com versionamento semântico.

## Pré-requisitos Únicos (Fazer uma vez)

### 1. Configurar NPM Token no GitHub

```bash
# No NPM (https://www.npmjs.com/settings/ramonbsales/tokens):
# - Generate New Token → Automation
# - Copiar token

# No GitHub (settings/secrets/actions):
# - New repository secret
# - Name: NPM_TOKEN
# - Value: [Cole o token]
```

### 2. Verificar arquivo de workflow

O workflow deve estar em `.github/workflows/publish.yml` com:
- Trigger: `on: push tags: 'v*.*.*'`
- Build: `ng build shared-components --configuration=production`
- Publish: authenticado com `NPM_TOKEN`
- Node.js version: `>= 20`

## Processo de Publicação (Repetir a cada release)

### Passos Executar

1. **Atualizar versão no package.json:**
   - Arquivo: `projects/shared-components/package.json`
   - Campo: `"version": "X.Y.Z"`
   - Seguir semântico: `MAJOR.MINOR.PATCH`

2. **Commit e tag:**
```bash
git add projects/shared-components/package.json
git commit -m "chore: bump version to X.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

### Exemplo Completo

```bash
# De v1.0.0 para v1.1.0
# 1. Editar: projects/shared-components/package.json → "version": "1.1.0"
# 2. Executar:
git add projects/shared-components/package.json
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push && git push --tags
```

### Acompanhar Publicação

- GitHub Actions: https://github.com/ramonborges15/noah-angular/actions
- NPM package: https://www.npmjs.com/package/@ramonbsales/noah-angular
- Tempo: ~2-3 minutos

## Instruções para o Claude (Prompt)

```
Preciso publicar uma nova versão da biblioteca Angular no npm.

Informações do projeto:
- Workspace: /root/Pessoal/noah-angular
- Biblioteca: shared-components (@ramonbsales/noah-angular)
- Versão atual: [INFORMAR VERSÃO ATUAL]
- Próxima versão: [INFORMAR PRÓXIMA VERSÃO]

Siga o skill: PUBLISH_SKILL.md

Tarefas:
1. Atualizar arquivo: projects/shared-components/package.json → "version": "[PRÓXIMA VERSÃO]"
2. Fazer commit: "chore: bump version to [PRÓXIMA VERSÃO]"
3. Criar tag: v[PRÓXIMA VERSÃO]
4. Fazer push e push --tags

Confirme quando terminar.
```

## Troubleshooting

| Erro | Solução |
|------|---------|
| `Node.js version X.X.X detected. Angular CLI requires minimum v20.19 or v22.12` | Atualizar Node.js no workflow: `.github/workflows/publish.yml` → `node-version: '20'` |
| `npm ERR! 403 Forbidden` | Verificar NPM_TOKEN no GitHub secrets (Settings → Secrets) |
| Tag já existe | Deletar tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z` |
| Build falha | Verificar: `npm ci && npm run build` localmente antes de fazer tag |

## Checklist Rápido

- [ ] Versão atualizada em `projects/shared-components/package.json`
- [ ] NPM_TOKEN configurado no GitHub secrets
- [ ] Workflow em `.github/workflows/publish.yml` com Node.js >= 20
- [ ] Tag criada com formato `vX.Y.Z`
- [ ] `git push && git push --tags` executado
- [ ] GitHub Actions executou com sucesso
- [ ] Package publicado em npmjs.com
