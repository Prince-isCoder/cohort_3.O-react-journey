# React — Day 2: JSX, Components & Props

## 0. Scaffolding note
Today's project used:
```
npm create vite@7
```
instead of `npm create vite@latest`. Reason: as of 11 Aug 2026, the latest Vite (`@8.1`/`@8.2`) had some instability/bugs, so `@7` was pinned for a stable setup. (If you're reading this later, the newest version may well be stable by then — check before blindly pinning `@7` forever.)

Setup commands — same as Day 2:
```
cd "project folder"
npm i          # or: npm install
npm run dev
```

### What `npm run dev` actually does, step by step
1. Compiles the whole project
2. Bundles it
3. Transpiles it via **Babel** (JS compiler — this is what lets JSX/modern syntax run in any browser)
4. Executes it
5. RDOM gets updated with the result

## 1. Anatomy of a fresh Vite + React project

| File | What it's for |
|---|---|
| `vite.config.js` | Vite's config — you'll rarely need to touch this. Shows `plugins: [react()]` because you picked React when scaffolding (would say `plugins: [vue()]` for a Vue project, etc.) |
| `README.md` | Project description — useful once you push to GitHub, so others (or future you) know what the repo does |
| `package.json` | The dependency registry — like an "app store manifest." `dependencies` = needed after deployment; `devDependencies` = dev-time only |
| `package-lock.json` | Exact locked versions of everything in `node_modules`. Never touch manually |
| `index.html` | The file actually responsible for the RDOM — the very first thing that runs after `npm run dev` |
| `index.css` | Global CSS for the whole project |
| `App.css` | CSS scoped to `App.jsx` specifically |

### First cleanup steps on any new project
1. Remove `<StrictMode>` from `main.jsx` (see below why)
2. Delete `App.css` (or its import) if you're not using it
3. Empty out the boilerplate content in `App.jsx`

## 2. `index.html` → `main.jsx` → `App.jsx` — how it all connects

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
Same shape as **Day 1's** manual setup (`<div id="root">` + `<script type="module" src="script.js">`) — Vite just automates it and points at `main.jsx` instead of a plain `script.js`.

**`main.jsx`** is where the actual root gets created and rendered — this is the direct equivalent of the `ReactDOM.createRoot(root).render(...)` line from Day 1/2:
```js
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
```

### ⚠️ Remove `<StrictMode>`
The default scaffold wraps `<App />` in `<StrictMode>`. Its main effect: it **intentionally double-invokes** certain code (component function bodies, some hooks) in development to help surface bugs (like accidental side effects). It's a dev-only safety net, not something that changes production behavior — but it can make console logs/behavior confusing while you're learning, so it's dropped here:
```js
createRoot(document.getElementById('root')).render(<App />)
```

### Why only one root element can be rendered
`.render()` accepts exactly **one** element. If you need multiple top-level elements, wrap them in a single parent:
```jsx
render(
  <div>
    <h1>Hello</h1>
    <h2>Hey</h2>
  </div>
)
```
This is exactly why the pattern is always "render one functional component" (`<App />`), and all your actual multi-element UI lives *inside* that component instead.

## 3. `App()` vs `<App />` — this is not a style choice

```jsx
App()      // ❌ don't call it like a plain function
<App />    // ✅ always render it as an element
```

**Why it matters:** `App()` just runs the function once, immediately, and produces a value — it has no ongoing connection to React's rendering system. `<App />` instead tells React "treat this as a component" — React can then re-invoke it on its own schedule whenever something changes, keeping the UI live/reactive.

With `App()`, if data changes later, nothing updates on screen unless you manually reload the page. With `<App />`, React's reconciliation (Day 2!) handles re-rendering automatically at runtime.

## 4. HMR (Hot Module Replacement)

When you save changes to a component, the terminal shows an `hmr update` line. **HMR** is Vite's mechanism for applying your edits **without a full page reload**:
- Tracks what changed in the component
- Feeds that into React's normal reconciliation pipeline (Old VDOM vs New VDOM → render phase → commit phase — same process from Day 2, just triggered by a file save instead of runtime state change)

## 5. JSX — what it actually is and why it exists

```jsx
let App = () => {
  return <h1>Hello</h1>
}
```
`App.jsx` is technically a **JavaScript file** — so how are HTML-looking tags legal inside it?

**JSX = JavaScript + XML** (some people expand it as "JavaScript and XML," others "JavaScript XML" — either way, XML being the markup-language part). It's not real HTML being interpreted by the browser — it's syntax that **Babel compiles down to plain JS function calls** before anything runs.

### Without JSX (the Day 1/2 way, by hand)
```jsx
import React from "react"

let App = () => {
  let ui = React.createElement("div", {}, [
    React.createElement("h1", {}, "Hello"),
    React.createElement("h2", {}, "Bye"),
    React.createElement("h3", {}, "Come again")
  ])
  return ui
}

export default App
```
Technically correct, but imagine writing an entire real app (like Apple's or Spotify's site) this way — deeply nested `createElement` calls become unreadable fast.

### With JSX (what Babel lets you write instead)
```jsx
let App = () => {
  return <div>
    <h1>Hello</h1>
    <h2>Bye</h2>
    <h3>Come again</h3>
  </div>
}

export default App
```
Same output, dramatically more readable. Babel transpiles this back into the `React.createElement(...)` calls under the hood — you're not writing a different language, just a much cleaner syntax for the same thing.

> 📝 With modern React (17+), you don't need to manually `import React from "react"` just to use JSX — the newer JSX transform handles that automatically behind the scenes. You'd still import React explicitly only if you're calling `React.createElement` (or other `React.x` APIs) directly yourself.

## 6. Components — the rules

A **component** is just a function — with a few strict conventions layered on top:

1. **File name starts with a capital letter** — `App.jsx`, `About.jsx`.
2. **Function name also starts with a capital letter** — this is how JSX tells a custom component (`<About />`) apart from a plain HTML tag (`<div>`, lowercase).
3. **Always call components as elements**, never as plain function calls:
   ```jsx
   <About /> ✅
   About()   ❌
   ```

> 📝 Not every `.jsx`-adjacent file needs a capital letter — `main.jsx` stays lowercase because it isn't a component itself, just the entry-point script that renders one.

**Mental model:** components are **Lego blocks** — small, self-contained pieces you snap together to build a full UI.

```jsx
// About.jsx
let About = () => {
  return <h1>Hey I am about</h1>
}
export default About

// App.jsx
import About from './About'

let App = () => {
  return <div>
    <h1>Hello</h1>
    <About />
  </div>
}
export default App
```

### Function vs Functional Component
```
JSX ✅
Components
 ├─ function              ✅
 └─ functional component  ✅
```
These aren't the same thing — a *function* is any regular JS function. A *functional component* is specifically a function that follows the capital-letter + "used as an element" rules above, and returns JSX. All functional components are functions; not all functions are components.

## 7. Props

In a plain function, you pass **parameters/arguments**:
```js
let abc = (para) => { console.log(para) }
abc(args)
```
In a **functional component**, you pass **props** instead — written like HTML attributes on the tag:
```jsx
let App = (props) => {
  console.log(props)
}

<App name="Prince" age={18} />
```

### Key facts about props
- `props` is an **object** — always. If you render `<About />` with no attributes at all, `props` comes through as an empty object (`{}`), and `props.name` would be `undefined`.
- Unlike a plain function (where you must match the exact parameter count), you can pass **as many props as you want** — no fixed arity.
- Props aren't limited to strings/numbers — you can pass **elements** as a prop value too:
  ```jsx
  <About elem={<p>Hello this is p</p>} />
  ```
  Logging `elem` inside `About` shows it's just another lightweight React element object, same shape as anything `React.createElement` produces.

### Destructuring props (cleaner than `props.x` everywhere)
```jsx
<About width="500" name="Prince" elem={<p>Hello this is p</p>} />
```
```jsx
let About = ({ width, name, elem }) => {
  console.log(width)
  console.log(name)
  console.log(elem)
}
```

### Passing children
Anything written **between** a component's opening and closing tags becomes a special prop called **`children`** — this only works with a paired tag (`<About>...</About>`), not a self-closing one (`<About />`).
```jsx
// App.jsx
<About name="Prince" elem={<p>Hello this is p</p>}>
  <h1>Hello I am children</h1>
</About>
```
```jsx
// About.jsx
let About = ({ name, children }) => {
  console.log(children)
  return <div>
    <h1>Hey I am About</h1>
    { children }
  </div>
}
export default About
```
`children` is a **reserved name** for this — you can't destructure whatever's between the tags under a different key; it always arrives as `children`.

## 8. Checking today's actual files

```jsx
// main.jsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
```
✅ Correct — `<StrictMode>` already removed, single component rendered.

```jsx
// App.jsx
import About from './About'

let App = (props) => {
  return <div>
    <h1>Hello</h1>
    <h2>Bye</h2>
    <h3>Come again</h3>
    <About name="Prince" elem={<p>Hello this is p</p>}>
      <h1>Hello I am children</h1>
    </About>
  </div>
}

export default App
```
✅ Correct — no `import React` needed here since only JSX is used (no direct `React.createElement` calls), matching the modern JSX transform note above. `props` param is unused (fine — `App` isn't actually receiving any props from `main.jsx` here) but harmless to leave in.

```jsx
// About.jsx
let About = ({ name, children }) => {
    console.log(children)
    return <div>
        <h1>Hey I am About</h1>
        { children }
    </div>
}
export default About
```
✅ Works correctly — renders the passed-in `children` (`<h1>Hello I am children</h1>`) alongside the static heading.

> 📝 Small observation, not a bug: `name` is destructured but never actually used in the returned JSX (only `children` is rendered) — harmless, but if the intent was to also show "Hey I am About, {name}" somewhere, that line's missing. Worth adding once you're testing prop display, not required for what's here to work.

## 📌 Interview Notes
- **Q: What is JSX?** Syntax that looks like HTML/XML but is really JavaScript — Babel compiles it into `React.createElement(...)` calls before it ever runs in the browser.
- **Q: Why must component names be capitalized?** So JSX can distinguish a custom component (`<About />`) from a built-in HTML tag (`<div>`) — lowercase is always treated as a native DOM element.
- **Q: What's the difference between calling `<App />` and `App()`?** `<App />` registers it with React's rendering/reconciliation system, so it re-renders automatically on updates. `App()` just runs the function once as a plain call — no reactivity.
- **Q: What is `props`?** An object automatically passed to every functional component, built from whatever attributes/children were set on its JSX tag. Empty object by default if nothing was passed.
- **Q: How do you receive content nested between a component's tags?** Via the reserved `children` prop — only available when the component is used with a paired tag, not self-closing.

## Quick Revision
- Vite scaffold → clean up `<StrictMode>`, `App.css`, boilerplate `App.jsx` content first.
- `index.html` → `main.jsx` → `App.jsx` mirrors Day 1's manual `HTML → script.js` root-render setup, just automated.
- Always `<App />`, never `App()` — reactivity depends on it.
- HMR = Vite applying your saved changes via React's own reconciliation, without a full reload.
- JSX is sugar over `React.createElement`, compiled by Babel — not real HTML.
- Components = capitalized functions, called as elements, returning JSX. Function ≠ functional component (all functional components are functions; not all functions are components).
- Props = an object of whatever was passed as attributes; can hold any value, including elements. `children` is the reserved prop for nested tag content.