# GDPR Datamap Demo App

This app is built with React/Typescript as best according to the brief given. Claude AI has been used and configured with context limiting instruction files and a bit of Agentic Orchestration. In order to get better results and the best use of AI we need to give it as clear as possible instructions.
That being said after each section or piece of AI generated code is completed I do review it like any commit or PR. I find it still requires some manual refactoring and rearragning of the code - and it is also essential to know what is going on as if you wrote the code yourself.

# You can test this app live deployed on a server here: https://gdpr-datamap.vercel.app/

OR

# To run locally you can clone the app, CD into /fides-dashboard and run npm install. 
# When that completes then type npm run dev to start the app locally.

# Component/Unit tests
Npm run test in that same folder will run all the component/unit tet that are localted in the __tests__ folder.

# E2E Tests live in `e2etests/` (configured in `playwright.config.ts`). The dev server runs on `http://localhost:5177`.

```bash
npx playwright test                        # Run all tests (all browsers)
npx playwright test --project=chromium    # Chromium only
npx playwright test e2eests/foo.spec.ts # Single file
npx playwright test --ui                  # Interactive UI mode
npx playwright test --debug               # Step-through debugger


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
