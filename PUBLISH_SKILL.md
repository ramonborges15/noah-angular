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
- Trigger: `on: push tags: 'v*.*.*'` (recomendado — corresponde ao semver)
- Build: `ng build shared-components --configuration=production`
- Publish: authenticado com `NPM_TOKEN`

Nota: o workflow atual também aceita `v*` (mais permissivo). Recomendo alinhar a documentação e o workflow para usar `v*.*.*` se você quer forçar tags no formato semântico.

## Processo de Publicação (Repetir a cada release)

### Passos Executar

1. **Atualizar versão no package.json:**
   - Arquivo: `projects/shared-components/package.json`
   - Campo: `"version": "X.Y.Z"`
   - Seguir semântico: `MAJOR.MINOR.PATCH`

1.5 **Atualizar `CHANGELOG.md`:**
   - Atualize `CHANGELOG.md` com as notas de release apropriadas antes de commitar a nova versão.
   - O update do `CHANGELOG.md` é obrigatório para proceder com o tag/push.

2. **Commit, changelog e tag:**
```bash
git add projects/shared-components/package.json
git commit -m "chore: bump version to X.Y.Z"
# Recomendo usar tag anotada (melhor histórico) e empurrar somente a tag criada:
git tag -a vX.Y.Z -m "chore: release vX.Y.Z"
git push origin vX.Y.Z
```

### Exemplo Completo

```bash
# De v1.0.0 para v1.1.0
# 1. Editar: projects/shared-components/package.json → "version": "1.1.0"
# 2. Executar:
git add projects/shared-components/package.json
git commit -m "chore: bump version to 1.1.0"
git tag -a v1.1.0 -m "chore: release v1.1.0"
git push origin v1.1.0
```

### Acompanhar Publicação

- GitHub Actions: https://github.com/ramonborges15/noah-angular/actions
- NPM package: https://www.npmjs.com/package/@ramonbsales/noah-angular
- Tempo: ~2-3 minutos

## Melhorias opcionais (sugestões)

- **Badge de status:** adicione badges do GitHub Actions e do npm no `README.md` para monitorar builds e publicações rapidamente.
- **`npm publish --dry-run`:** considere adicionar um passo `--dry-run` no workflow para validação automática antes de publicar de fato.
- **Changelog / Release notes:** padronize um `CHANGELOG.md` ou adicione notas ao criar a Release no GitHub para melhorar rastreabilidade.
- **Tag anotada por padrão:** prefira `git tag -a vX.Y.Z -m "chore: release vX.Y.Z"` para incluir a mensagem e facilitar o histórico no GitHub.
- **Remessa seletiva de tags:** use `git push origin vX.Y.Z` em vez de `git push --tags` para evitar empurrar tags não intencionais.
- **Token e permissões:** confirme que o `NPM_TOKEN` é do tipo `Automation` e tem permissão para publicar o pacote scoped.

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
2. Atualizar `CHANGELOG.md` com as notas da release e commitar
3. Fazer commit: "chore: bump version to [PRÓXIMA VERSÃO]"
4. Criar tag: v[PRÓXIMA VERSÃO] (recomendo tag anotada)
5. Fazer push da tag: `git push origin v[PRÓXIMA VERSÃO]`

Confirme quando terminar.
```

## Checklist Rápido

- [ ] Versão atualizada em `projects/shared-components/package.json`
- [ ] NPM_TOKEN configurado no GitHub secrets
- [ ] Tag criada com formato `vX.Y.Z`
- [ ] `git push && git push --tags` executado
- [ ] GitHub Actions executou com sucesso
- [ ] Package publicado em npmjs.com
 - [ ] `CHANGELOG.md` atualizado e commitado (obrigatório)
