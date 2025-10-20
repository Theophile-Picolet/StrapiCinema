# Lint & GitHub Actions – ce que j'ai fait (rapide)

Date: 20 octobre 2025

## 1) ESLint côté projet

- globals.node: dit à ESLint que le code tourne côté Node (pas navigateur)
- parser: tseslint.parser: permet d'analyser correctement le TypeScript
- extends: configs recommandées JS + TS (bonnes pratiques par défaut)
- ignores: on ignore les dossiers générés (dist, .cache, build, .tmp)
- règles adaptées Strapi/Node:
  - no-console: off → on autorise les logs utiles
  - @typescript-eslint/no-unused-vars: warn → avertit sans casser
  - explicit-function-return-type: off → moins verbeux
  - no-require-imports: off → Strapi peut utiliser require()

## 2) Scripts npm (package.json)

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts",
    "lint:fix": "eslint . --ext .js,.ts --fix"
  }
}
```

- npm run lint: lance l’analyse
- npm run lint:fix: corrige automatiquement quand c’est possible

Si besoin d’installer manuellement:
```bash
npm i -D eslint @eslint/js typescript-eslint globals
```

## 3) Workflow GitHub Actions (ci.yml)

Ajouts/modifs:
- Étape "Lint code": exécute npm run lint
- Étape "Auto fix lint issues": exécute npm run lint:fix

Extrait:
```yaml
#  Vérifie la qualité du code (ESLint)
- name: Lint code
  run: npm run lint

# Corrige automatiquement les petits problèmes
- name: Auto fix lint issues
  run: npm run lint:fix
```

Résultat:
- Le lint tourne en CI à chaque push/PR
- Petites erreurs auto-corrigées, le reste signalé clairement
- Dev + CI alignés sur les mêmes règles
