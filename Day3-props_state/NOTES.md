# React — Props & State: Imports, Component Structure, Re-render & `useState`

## 0. Recap — what's covered so far
- React 0 → Vite → `npm create vite@7` → `package.json` / `node_modules` / `package-lock.json`
- `npm run dev` pipeline: `package.json` → `index.html` → `src/main.jsx` → Virtual DOM → Reconciliation → HMR
- **JSX** = JavaScript XML, transpiled by **Babel**
- **Components** = capitalized functions ("Lego blocks"), rendered as elements (`<App />`, never `App()`)
- **Props** ≠ arguments — always an object, passed like HTML attributes:
  ```jsx
  <App name="Prince" age={18} />
  ```
  ```jsx
  let App = ({ name, age }) => { console.log(name, age) }
  // or
  let App = (props) => { console.log(props.name, props.age) }
  ```

## 1. Setup (same steps every time)
```
npm create vite@7
cd "folder name"
npm i
npm run dev
```
Standard cleanup: remove `<StrictMode>`, delete `App.css`, empty out `App.jsx`.

## 2. Multiple components — basic wiring

```jsx
// Contact.jsx
import React from 'react'

const Contact = () => {
  return (
    <div>
      Hey I am contact
    </div>
  )
}

export default Contact
```
```jsx
// App.jsx
import React from 'react'
import Contact from './Contact'

const App = () => {
  return (
    <div>
      <h1>Hi I am an app</h1>
      <Contact />
    </div>
  )
}

export default App
```
**Import and export are both required** — a component defined but never exported can't be used anywhere else.

## 3. A quick detour — scope, before Import/Export makes sense

### ⚠️ Correction on "there's no global scope in JS"
The claim that a JS file gets **wrapped in a function**, so everything is really function-scoped, is only accurate for a specific case — not universally true:

| Environment | What actually happens |
|---|---|
| A plain `<script>` (no `type="module"`) | Top-level variables genuinely attach to the **real global object** (`window` in a browser) — true global scope exists here. |
| **CommonJS** (older Node.js `require`/`module.exports`) | Node literally wraps each file in a function behind the scenes: `(function(module, exports, require, __dirname, __filename) { ...your code... })`. This is where the "everything is secretly function-scoped" idea comes from. |
| **ES Modules** (`import`/`export` — what Vite/React use) | Each file gets its own **module scope** instead. Top-level variables are *not* attached to `window`/globals, but this isn't because of a literal function wrapper — it's a separate scoping mechanism the module system provides. |

So: the *practical effect* ("top-level variables in this file aren't truly global") is correct for both CommonJS and ES Modules — but the *mechanism* differs, and true global scope does exist in the plain non-module `<script>` case. Worth knowing the distinction rather than treating "everything is wrapped in a function" as universally literal.

## 4. Export vs Export Default

| | Behavior |
|---|---|
| `export default` | One per file, max. Can be **imported under any name** you choose. |
| `export const x = ...` (named export) | Multiple allowed per file. Must be imported with the **same name**, wrapped in `{ }` — unless you explicitly rename it with `as`. |

```jsx
// test.jsx
export const one = () => { console.log("One") }
export const two = () => { console.log("Two") }

const three = () => { console.log("Three") }

export const four = () => { console.log("Four") }
export default three
```

```jsx
// App.jsx
import something from './test'     // default import, can be named anything
import one from './test'           // ⚠️ see correction below
import { four } from './test'      // named import — needs matching name + { }
```

### ⚠️ Correction — what `one()` actually logs
The original notes claimed `one()` "still prints One" — that's not right, and the reasoning given (*"because we didn't destructure it, so react thinks we are importing a default export again"*) is actually the correct **reasoning**, it just wasn't followed to its correct conclusion:

```js
import one from './test'   // no { } → this is a DEFAULT import
```
Without `{ }`, this always binds to whatever was `export default`ed — in `test.jsx`, that's `three`. So the local name `one` here is really just a nickname for the `three` function. Calling it:
```js
one()   // logs "Three" — NOT "One"
```
The real named export called `one` (the one that would log `"One"`) is only reachable via:
```js
import { one } from './test'
one()   // logs "One"
```
**Rule of thumb:** no curly braces = you're grabbing the default export, whatever you name it locally. Curly braces = you're grabbing a specific named export, and the name inside `{ }` must match the export's actual name (unless renamed with `as`).

### Renaming a named import
The notes said named exports "have to keep the same name" — mostly true, but there's an escape hatch:
```js
import { four as f } from './test'
f()   // still logs "Four" — renamed locally, still points to the same export
```
Without `as`, yes — the name inside `{ }` must exactly match the export's name, or you get:
```
Uncaught SyntaxError: The requested module '/src/test.jsx' does not provide an export named 'fourr'
```

## 5. Your open question — why does `{something()}` work *inside* `return`?

> *"Why did I call `one()`, `two()`, `something()` above `return`, not inside it — and why did `{something()}` inside the JSX also work when I tried it?"*

**The framing in the original notes was slightly off.** It's not that "normal JS only runs above `return`, and `return` is special/HTML-only." Here's what's actually happening:

- Everything inside a component function — including the `return (...)` — is still **regular JavaScript**. JSX is not a separate language partition; it's syntax that Babel compiles into `React.createElement(...)` calls, which are themselves just function calls, evaluated as part of running your component function.
- Any `{ }` you write **inside JSX** is simply **"drop in a JavaScript expression here."** It's evaluated at the exact moment React is building that element tree — which happens when your component function runs (i.e., when React calls it to render).
- So `{something()}` inside JSX and `something()` written above `return` are both just **function calls** — the only difference is *where the result goes*. Above `return`, the result is discarded (or stored in a variable) and has no visual effect. Inside `{ }` in JSX, the **return value** of that call becomes part of the rendered output.

That's why it worked when you tried it: there's no special rule blocking function calls inside JSX — `{ }` accepts any valid JS *expression* (not statements like `if`/`for`, but expressions like function calls, ternaries, math, etc.), and a call like `something()` is just an expression like any other.

**Why `one()`/`two()`/`something()` looked like they "had to" go above `return` in the original example:** those calls were made purely for their **side effect** (`console.log(...)`), not for a value to display. `console.log(...)` returns `undefined` — if you'd written `{something()}` in that version, it would've rendered `undefined` (which React silently ignores/renders as nothing) while still running the console.log as a side effect. So it wasn't disallowed inside `return` — it just wouldn't have visibly done anything different there, which is likely why it looked like a "return can't do this" rule when it was really just "there was no reason to."

## 6. Organizing multiple components — the `components/` folder convention

Once you have a handful of components, dumping them all flat inside `src/` gets messy:
```
❌ src/
    App.jsx
    Contact.jsx
    Hero.jsx
    Navbar.jsx
    Footer.jsx
    main.jsx
    index.css
```
Convention: put components in their own `src/components/` folder:
```
✅ src/
    components/
        Navbar.jsx
        Hero.jsx
        Footer.jsx
        Contact.jsx
    assets/
    App.jsx
    main.jsx
    index.css
```
Update the import paths to match:
```jsx
// App.jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Contact from './components/Contact'
import Footer from './components/Footer'

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
```
This is exactly the **Lego-blocks idea** from earlier — each component is a self-contained piece, and `App.jsx` just assembles them in order.

## 7. Re-render — the actual problem, and why plain variables don't work

### Why you can't just `document.querySelector` a JSX element
```jsx
// ❌ This breaks
let btn = document.querySelector("#btn")
btn.addEventListener("click", () => { console.log("Btn is clicked") })
```
A JSX-rendered `<button>` isn't a real DOM node **yet** at the point your component function runs — it's built via `React.createElement(...)`, part of the **Virtual DOM**, not something `document.querySelector` can find (it only searches the real DOM). React itself is responsible for attaching real event listeners once it commits the element to the real DOM.

**Fix — use inline event props instead:**
```jsx
<button onClick={() => {
  count++
  console.log(count)
}} id='btn'>Increment</button>
```
> 📝 Inside JSX, you write plain `{ }` for embedded expressions/callbacks — no need for the template-literal `${ }` syntax; that's only for actual JS template strings, a different thing entirely.

### Why `count++` doesn't show on screen, even though the console logs correctly
```jsx
const App = () => {
  let count = 0

  return (
    <div>
      <h1>Count - {count}</h1>
      <button onClick={() => {
        count++
        console.log(count) // this DOES increment correctly
      }} id='btn'>Increment</button>
    </div>
  )
}
```
Clicking the button only runs the **callback** — it doesn't re-run the whole `App` function, so nothing on screen updates. And even if you tried to force `App()` to run again, `let count = 0` at the top would just reset it back to `0` every single time — the click's incrementing has nowhere to "stick."

### Re-render ≠ Reload

| | What happens |
|---|---|
| **Reload** | The whole page restarts from scratch — all state lost, back to `0`. |
| **Re-render** | Only the component function re-runs to reflect updated data — the *data itself* is preserved and carried forward, not reset. |

Plain `let` variables can't survive across re-renders on their own — they get reinitialized every time the function runs. You need something that persists *outside* the function's own execution, tied to that specific component instance.

## 8. `useState` — the hook that makes this possible

**Hooks** are what make React "React" — special functions (all named `use...`, visible if you `console.log(React)` and see `useState`, `useEffect`, `useRef`, etc.) that let function components tap into React's internal machinery (state, lifecycle, context, and more).

```jsx
import React, { useState } from 'react'

const App = () => {
  let res = useState()
  console.log(res)   // [undefined, f]
  ...
}
```
Calling `useState()` with no argument returns an array of exactly two things:
1. The **current state value** (`undefined` here, since no initial value was given)
2. A **function** to update that state

### Destructuring the pair
```js
let [state, setState] = useState()
```
- `state` — the current value.
- `setState` — does **two** jobs at once: (1) updates the stored value, (2) tells React to **re-render** the component that owns this state.

### Fixing the counter with `useState`
```jsx
import React, { useState } from 'react'

const App = () => {
  let [count, setCount] = useState(0)

  return (
    <div>
      <h1>Count - {count}</h1>
      <button onClick={() => {
        setCount(count + 1)
      }}>Increment</button>
    </div>
  )
}

export default App
```
`0` is the initial value. `setCount(count + 1)` both updates the stored count **and** triggers React to re-run `App`, this time with `count` starting from its *new* stored value instead of resetting to `0` — this is the re-render, not a reload.

### Multiple independent states in one component
```jsx
let [count, setCount] = useState(0)
let [flag, setFlag] = useState(true)
```
Each `useState()` call manages its **own independent** piece of state — updating one doesn't reset or affect the other.

### ⚠️ Important behavior — React skips unnecessary re-renders
```jsx
<button onClick={() => setFlag(false)}>Flag</button>
```
Given `flag` starts as `true`:
- **1st click:** `setFlag(false)` — value actually changes (`true → false`) → re-render happens.
- **2nd click:** `setFlag(false)` again — value is **already** `false` → React detects no real change and **skips the re-render** entirely.
- **3rd+ clicks:** same — no change, no re-render.

**Why:** React compares the new state value against the current one (roughly, using `Object.is`), and if they're identical, it bails out of re-rendering that component — an optimization to avoid pointless work. This is a real, documented React behavior, not a bug or a fluke.

## 📌 Interview Notes
- **Q: What's the difference between a default export and a named export?** One default export per file, importable under any local name; named exports can have many per file, must be imported with the exact matching name (in `{ }`) unless explicitly renamed with `as`.
- **Q: Why can't you attach a `document.querySelector` event listener to a JSX element directly?** JSX elements are Virtual DOM objects (from `React.createElement`), not real DOM nodes, until React commits them — use inline event props (`onClick={...}`) instead.
- **Q: What's the difference between re-render and reload?** Reload restarts the entire page and loses all state. Re-render just re-runs the component function to reflect updated data — existing state is preserved, not reset.
- **Q: What does `useState()` return?** An array: `[currentValue, updaterFunction]`. The updater both changes the stored value and triggers a re-render of the component that owns it.
- **Q: Why might calling a state setter with the same value not trigger a visible update?** React compares old vs new state and skips re-rendering if nothing actually changed — this is a built-in optimization, not a bug.

## Quick Revision
- `export default` → one per file, any import name. Named `export` → many per file, exact name required (or use `as` to rename).
- No curly braces on import = you're grabbing the default export, whatever local name you give it.
- `{ expression }` inside JSX just evaluates any JS expression at render time — function calls work identically whether written above `return` or inline inside JSX; the only difference is whether the *result* becomes visible output.
- Group multiple components into `src/components/`, keep `App.jsx` as the assembly point.
- Plain `let` variables reset on every re-render — they can't hold state across renders on their own.
- `useState(initialValue)` → `[state, setState]`. Calling `setState` updates the value **and** triggers a re-render (not a reload — existing state elsewhere is untouched).
- React skips re-rendering when a state setter is called with a value identical to the current one.=