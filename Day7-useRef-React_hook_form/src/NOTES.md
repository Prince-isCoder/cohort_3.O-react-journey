# React — Day 7: `useRef` & React Hook Form

## 1. The problem `useRef` solves

With a controlled input (`value` + `onChange` + `useState`), **every single keystroke** triggers a state update, which triggers a re-render of the whole component — even if all you actually wanted was to grab the final typed value once, at submit time. For a form with many fields, that's a lot of unnecessary re-rendering just to track characters as they're typed.

## 2. `ref` — a direct handle to the real DOM element

Every DOM-backed JSX element — `<input>`, `<form>`, `<div>`, all of them — can take a `ref` callback prop, which React calls with the **actual real DOM node** once it's mounted:
```jsx
<input ref={(e) => console.log(e)} className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Product Name' />
```
```
// prints the real element:
<input id='product-name' className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Product Name'>
```
This is a genuine reference to the real DOM node — the same kind of object `document.querySelector(...)` would give you, not a Virtual DOM object.

## 3. `useRef` — the hook version of this

`useRef()` is a hook that gives you a **persistent, mutable container** — an object shaped like `{ current: ... }` — that survives across re-renders without itself causing one when updated. Passed to a JSX element's `ref` prop, React automatically sets `.current` to that element's real DOM node once mounted.

```jsx
let inpRef = useRef()
console.log(inpRef)   // { current: null } before mount, { current: <input> } after

return (
  <div>
    <form>
      <input ref={inpRef} />
    </form>
  </div>
)
```
Reading the current value later (e.g. on submit) just means reaching into `inpRef.current.value` — the live real-DOM value at that exact moment, no state tracking needed along the way.

> 📝 `useRef` isn't limited to DOM elements — it can hold **any** mutable value you want to persist across renders (a timer ID, a previous value, a counter that shouldn't trigger re-renders) — attaching it to `ref` on a JSX element is just its most common use.

### The key advantage over `useState`
- **`useState`** → every update via the setter triggers a **re-render**. Great when the UI needs to visually reflect the change on every keystroke.
- **`useRef`** → updating `.current` does **not** trigger a re-render at all. Great when you just need to *read* a value later, without needing the screen to reactively update on every change along the way.

> ⚠️ Correction: it's not accurate to say "`useRef` can store multiple references" as if one `useRef()` call holds several values — each `useRef()` call manages exactly **one** `.current` slot. What's true is that you can call `useRef()` **multiple times** in the same component (one per element/value you need to track), or store a single array/object inside one ref's `.current` if you're tracking a dynamic list of elements (e.g. mapped inputs).

## 4. `onChange` (React) vs native `onchange` — and how `ref` differs from both

| | Native HTML | React (`onChange`) |
|---|---|---|
| Attribute style | `onchange=""` (lowercase, string) | `onChange={}` (camelCase, JS expression) |
| Event object you receive | A plain native `Event` | A **`SyntheticBaseEvent`** — React's own event wrapper around the native event, providing a consistent cross-browser API |

> 📝 A precise note on the "onChange vs ref" distinction: `e.target` inside a React `onChange` handler is still the **real DOM node** underneath — React's synthetic event just *wraps* the native event object, it doesn't replace `target` with some separate Virtual DOM stand-in. The real practical difference isn't "which DOM you get" — it's **when and how often you're forced to read it**. `onChange` fires (and, if you use it to call a state setter, re-renders) on **every single change**. `ref` gives you a standing handle to the element you can read from **whenever you want** — typically just once, at submit — without hooking into state or triggering re-renders along the way.

**Rule of thumb:** if you need React to *react* to every change (live validation, live character count, controlled display) → `onChange` + state. If you just need the final value at some later point (like form submission) → `ref`, no per-keystroke re-render needed.

## 5. React Hook Form (RHF)

### What it is
An open-source form-management library built specifically to minimize re-renders — instead of the controlled-input pattern (state + `onChange` on every field), it reads input values directly via refs under the hood, only touching React's render cycle when it actually needs to (validation errors, final submit).

### Setup
```
npm install react-hook-form
```
```jsx
import { useForm } from 'react-hook-form'

let data = useForm()
console.log(data)
```
`useForm()` returns one large object containing everything you need to wire up a form — control handles, validation state, helper functions, etc.

> 📝 If you see this object logged **twice** in the console during development, that's most likely **React 18's `<StrictMode>`** intentionally double-invoking component logic in dev builds (to help surface bugs from side effects) — not two genuinely separate `useForm()` instances. Both logs refer to the same underlying form state.

### Destructuring what you actually need
```jsx
let { register, handleSubmit, reset, formState: { errors } } = useForm()
```
- `register` — connects an input to the form (see below).
- `handleSubmit` — wraps your own submit callback; handles `preventDefault()` and validation automatically, and hands your callback the collected form data.
- `reset` — clears the form back to its default values.
- `formState.errors` — validation error state, populated automatically based on rules you set on each field.

### Wiring up inputs with `register`
```jsx
<input {...register("productName")} />
<input {...register("price")} />
```
```jsx
<form onSubmit={handleSubmit((data) => console.log(data))}>
```
Note there's no manually-written `handleSubmit` function here — `handleSubmit` comes straight from `useForm()`, and it itself takes **your** callback as an argument, calling it with the fully assembled `data` object once the form validates successfully.

### What `register("productName")` actually returns
```js
register("productName")
// roughly returns:
{
  name: "productName",
  onChange: (e) => { /* internally tracks the value via ref, not state */ },
  onBlur: (e) => { /* triggers validation */ },
  ref: (element) => { /* THIS is the useRef connection — attaches directly to the real DOM node */ },
  required: undefined  // or whatever validation rules you passed
}
```
`{...register("productName")}` **spreads** all of these generated props directly onto the `<input>` — exactly the same idea as manually passing `name`, `onChange`, and `ref` yourself, just generated for you based on the field name you pass in (`"productName"`).

### Why this connects back to `useRef`
The `ref` function inside that returned object is the actual mechanism that makes RHF fast: instead of updating React state on every keystroke (which would re-render the whole form each time, same as the manual controlled-input pattern from earlier lessons), RHF attaches a **ref** to each input and reads values directly off the real DOM node — via `.current`, same underlying pattern covered above — only touching React's state/render cycle when it truly needs to (showing a validation error, or handing off the final data on submit).

This is exactly why `useRef` was worth learning first: **React Hook Form's whole performance advantage is built on the same "grab the DOM value without state/re-renders" idea**, just automated and packaged into a reusable library.

## 📌 Interview Notes
- **Q: What's the core difference between `useState` and `useRef`?** Updating state via `useState`'s setter always triggers a re-render. Updating `.current` on a `useRef` object does not — it silently persists across renders.
- **Q: What does `ref` give you when attached to a JSX element?** A direct reference to the real underlying DOM node, once mounted — the same kind of object `document.querySelector` would return.
- **Q: What is a `SyntheticBaseEvent`?** React's wrapper around the native browser event, passed to event handlers like `onChange`, providing a consistent API across browsers — `event.target` still points to the real DOM element underneath.
- **Q: Why is React Hook Form more performant than manually controlled inputs?** It attaches `ref`s to inputs (via the object returned from `register()`) instead of driving every field through `useState` + `onChange`, so typing doesn't force a re-render on every keystroke.

## Quick Revision
- `ref={(el) => ...}` or `useRef()` + `ref={myRef}` → direct access to the real DOM node, no re-render triggered by reading/writing it.
- `useState` → every update re-renders. `useRef` → updates persist silently, no re-render.
- React's `onChange` gives a `SyntheticBaseEvent` wrapping the native event — `event.target` is still the real DOM node either way; the real distinction from `ref` is *how often* you're forced to read the value (every keystroke vs whenever you choose).
- React Hook Form: `useForm()` → destructure `register`, `handleSubmit`, `reset`, `formState.errors`. Spread `{...register("fieldName")}` onto each input; wrap your submit logic in `handleSubmit(callback)`.
- RHF is fast specifically because `register()`'s returned props include a `ref` — same underlying mechanism as manual `useRef`, just automated per field.