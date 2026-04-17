# GDPR Datamap Demo App

This app is built with React/Typescript as best according to the brief given. Claude AI has been used and configured with context limiting instruction files and a bit of Agentic Orchestration. In order to get better results and the best use of AI we need to give it as clear as possible instructions.
That being said after each section or piece of AI generated code is completed I do review it like any commit or PR. I find it still requires some manual refactoring and rearragning of the code - and it is also essential to know what is going on as if you wrote the code yourself.

# View live on web:
You can test this app live deployed on a server here: https://gdpr-datamap.vercel.app/

OR

# To run locally 
You can clone the app, CD into /fides-dashboard and run npm install. 
When that completes then type npm run dev to start the app locally.

# Component/Unit tests
Npm run test in that same folder will run all the component/unit tet that are localted in the __tests__ folder.

# E2E Tests

E2E Tests live in `e2etests/` (configured in `playwright.config.ts`). The dev server runs on `http://localhost:5177`.


npx playwright test                        # Run all tests (all browsers)
npx playwright test --project=chromium    # Chromium only
npx playwright test e2eests/foo.spec.ts # Single file
npx playwright test --ui                  # Interactive UI mode
npx playwright test --debug               # Step-through debugger

# Time spent: 
Approx 4hours.

# Any assumptions you made:
That the extra duplicated item in the .json should be ignored.

# Any trade-offs you made:
Bundle size is one big chunk and I did not have time left to employ code splitting etc and so handle this issue in the end. Also some of the css (tailwind) could be moved to classes were the lines get long or where there is repetition.

# Any special/unique features you added:
I added a draggable "Graph View" - it was not specified in the docs but it was fun to implement and could possilbe be developed into something more useful.
Also there is a show/hide button for the dependency arrows. Thre is also a toggle for light/dark mode in the top right corner.

# Anything else you want us to know about:
Even though I used a modern "Agentic" workflow with Claude I review every line of code. I find while AI often get things technically functioning well sometimes it needs a bit of restructure. Also I think its important whenever possible using AI/Agents etc you should try and know the code as well as if you wrote it all by hand. This is important from a maintenance/bugfix point of view but also from a psychological one as a dev - it helps you feel ownership and connection to the work.

# Any feedback you have on this technical challenge -- we care deeply about our hiring process here at Ethyca, and about the engineers who go through it (that's you!) -- we wholeheartedly promise any feedback will be met with a warm thank you!
Yes! - I would like to thank you for not trying to get me to compute "how many golfballs does it take to fill up a jumbo jet?" or similar whilst 3-4 other devs stare on at me. I think the idea of a take home challenge is a good one as I worked as I would normally on a job and we all know any worries about "Vibe Coding" can be easily uncovered in the debrief. I dont get why more companies are not doing it this way still.



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
