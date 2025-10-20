import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      // ignore le dossier buildé //
      "dist/**", 
      ".cache/**",
      "build/**",
      ".tmp/**",
    ],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        //  global interne à Strapi //
        strapi: "readonly", 
        // évite l’erreur no-undef //
        document: "readonly", 
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      //  Règles adaptées à Strapi //
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/explicit-function-return-type": "off",
      //  Strapi utilise require() //
      "@typescript-eslint/no-require-imports": "off", 
      "@typescript-eslint/prefer-namespace-keyword": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
]);
