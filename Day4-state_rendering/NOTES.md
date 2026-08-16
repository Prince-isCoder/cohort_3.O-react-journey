# React — Tailwind CSS, Batching & Functional State Updates

## 0. Setup (same every time)
```
npm create vite@7
cd "project folder"
npm i
npm run dev
```

## 1. Tailwind CSS — the core idea

### The problem it solves
Normally you'd write your own CSS classes and apply them:
```css
.bg-color { background-color: red; }
.border { border: 2px solid grey; }
.text { font-size: 24px; }
.rounded-border { border-radius: 24px; }
```
```jsx
<div className="border bg-color text rounded-border"></div>
```
**Tailwind is the same idea, pre-built for you.** Instead of writing your own CSS classes, Tailwind ships a massive library of ready-made utility classes — you just apply them directly in `className`, no separate CSS file to maintain per-component.

### Setup steps (via Vite)
1. Go to `tailwindcss.com` → Docs → "Using Vite"
2. Skip "Create your project" (already have one from `npm create vite`)
3. Install:
   ```
   npm install tailwindcss @tailwindcss/vite
   ```
4. Register the plugin in `vite.config.js`:
   ```js
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```
5. In your global CSS file (`index.css`), replace all existing content with just:
   ```css
   @import "tailwindcss";
   ```
   > ⚠️ The global CSS file should contain **only** this import — nothing else — or you can get conflicts/unexpected overrides.

### Using it
Same `className` pattern as always, just with Tailwind's own utility names instead of custom ones:
```jsx
<div className='bg-emerald-400 text-9xl font-bold'>Hello</div>
```

### Arbitrary values — going past Tailwind's built-in scale
```jsx
text-10xl   // ❌ not a real Tailwind class — Tailwind's built-in text sizes stop at text-9xl,
            //     so this does nothing (silently ignored, no styling applied)

text-[400px]  // ✅ square-bracket syntax lets you supply ANY arbitrary value
              //     Tailwind wasn't pre-built with, not just font sizes
```
This `[]` syntax works for most utilities (`w-[73px]`, `bg-[#1a1a1a]`, etc.) whenever the built-in scale doesn't have the exact value you need.

## 2. Batching — why multiple `setState` calls in one handler don't cause multiple re-renders

### The setup
```jsx
import React, { useState } from 'react'

const Counter = () => {
  console.log("Counter is rendering")
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

export default Counter
```
Baseline behavior — each `setCount` call updates the count **and** re-renders once, logging `"Counter is rendering"` once per click.

### The question — what happens with 3 calls in one handler?
```jsx
<button onClick={() => {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
}}>Increment</button>
```
Intuition might say: 3 calls → 3 re-renders → `"Counter is rendering"` logs 3 times → count jumps by 3.

**What actually happens:** the component re-renders **only once**, the log prints **once**, and the count only goes up by **1** — not 3.

### Why — Batching
React groups (**batches**) multiple `setState` calls that happen within the same event handler/synchronous block into a **single** re-render, instead of re-rendering after each individual call. All three calls get collected together and processed as one update.

**Why the count only increases by 1, not 3:** all three calls read `count` from the **same render's closure** — at the time the handler runs, `count` is still the *old* value for all three lines, so each call is really saying "set count to (old value) + 1" three separate times. React only applies the *last* one of those, since they all describe the same target value.

## 3. Functional updates — how to actually increment by 3

If you want a **fixed known amount**, just do the math directly:
```js
setCount(count + 3)
```

But if you need **multiple sequential `setState` calls** to each build on the *previous* update (not all reading the same stale `count`), pass a **function** instead of a value — this is the **functional update** form:

```js
setCount((prev) => prev + 1)
```

### ⚠️ Correction — the arrow function syntax
The notes had:
```js
setCount((prev) => return prev+1)   // ❌ this is a SYNTAX ERROR, not valid JS
```
You can't put the `return` keyword directly after `=>` like that. There are exactly two correct forms:
```js
setCount((prev) => prev + 1)           // ✅ implicit return — no braces, no `return` keyword
setCount((prev) => { return prev + 1 }) // ✅ explicit return — needs braces AND `return` together
```
Also, a version like:
```js
setCount((prev) => {
  prev + 1
})
```
compiles fine but does nothing useful — braces without an explicit `return` mean the function body just evaluates `prev + 1` and throws the result away, returning `undefined`. That's why the notes correctly flagged this form as producing `undefined`.

### Why functional updates fix the increment-by-3 problem
```js
setCount((prev) => prev + 1)
setCount((prev) => prev + 1)
setCount((prev) => prev + 1)
```
Each call now receives the **actual latest pending value** (`prev`) — not the stale `count` from the render's closure — so React chains them correctly: `0 → 1 → 2 → 3`. This is the reliable way to do multiple state updates that depend on each other in the same handler.

## 4. Mini project — Product Card CRUD (brief overview)

Same idea as the earlier vanilla-DOM product CRUD exercise, rebuilt in React — this time without an update feature, just **list + delete**.

**`App.jsx`** holds the data and the delete logic:
```jsx
const [productsData, setProductsData] = useState([ /* array of product objects */ ])

const deleteProduct = (id) => {
  let product = productsData.filter((elem) => elem.id !== id)
  setProductsData(product)
}

return (
  <div className='w-full min-h-screen flex flex-col bg-gray-700 p-4'>
    <div className='flex flex-wrap gap-6'>
      {productsData.map((elem) => (
        <ProductCard key={elem.id} product={elem} deleteCard={deleteProduct} />
      ))}
    </div>
  </div>
)
```
- `productsData` is now **state** (`useState`), not a plain array — so removing an item and calling `setProductsData` triggers a re-render, updating the visible list.
- `.map()` renders one `<ProductCard />` per product. `key={elem.id}` is React's way of tracking which list item is which across re-renders — required whenever you render a list, and should be a stable unique value (here, the product's own `id`), not the array index.
- `deleteProduct` uses `.filter()` to build a **new array** excluding the deleted item, rather than mutating `productsData` directly — this is the correct React pattern (state should be replaced, not mutated in place).
- Both `product` (the individual item) and `deleteCard` (the delete function itself) are passed down to `ProductCard` as **props**.

**`ProductCard.jsx`** is a "dumb" display component — it doesn't own any state, just renders what it's given and reports the delete click back up:
```jsx
const ProductCard = ({ product, deleteCard }) => {
  return (
    <div className='p-2 border-2 border-white rounded flex flex-col gap-2'>
      <img className='rounded' src={product.image} alt="" />
      <h2 className='font-semibold text-xl'>{product.title.substring(0, 20)}</h2>
      <p className='text-xs text-gray-300'>{product.category}</p>
      <p className='text-emerald-400'>${product.price}</p>
      <button onClick={() => deleteCard(product.id)} className='p-2 bg-red-600 text-white rounded w-full'>
        Delete
      </button>
    </div>
  )
}
```
- Destructures `product` and `deleteCard` straight out of props.
- `product.title.substring(0, 20)` truncates long titles so cards stay a consistent size.
- Clicking Delete calls `deleteCard(product.id)` — this runs the function that was actually defined in `App.jsx`, just invoked from inside the child. This is the standard React pattern for a child triggering a change in the parent's state: the parent owns the state and the update logic, and hands the child a function to call.

## 📌 Interview Notes
- **Q: What is batching in React?** Multiple `setState` calls made within the same synchronous event handler are grouped into a single re-render, instead of triggering one re-render per call.
- **Q: Why does calling `setCount(count + 1)` three times in a row only increment by 1?** All three calls read `count` from the same stale render's closure — they all compute the same target value, so only the last one effectively applies.
- **Q: How do you correctly chain multiple state updates that depend on each other?** Use the functional update form — `setCount(prev => prev + 1)` — which always receives the latest pending value instead of a stale closure value.
- **Q: Why does a list rendered with `.map()` need a `key` prop?** React uses `key` to track which rendered item corresponds to which array entry across re-renders, so it can correctly add/remove/reorder without confusing one item for another. It should be a stable unique identifier, not the array index.

## Quick Revision
- Tailwind = pre-built utility classes applied via `className`, no custom CSS needed for most styling.
- `text-[400px]` (square brackets) — the escape hatch for values outside Tailwind's built-in scale.
- Multiple `setState` calls in one handler → batched into a single re-render; each one still reads the same stale value unless using the functional form.
- Functional update: `setState(prev => prev + 1)` — correct syntax needs either no braces (`=> prev + 1`) or braces **with** an explicit `return`.
- List rendering: `.map()` + a stable `key` prop per item; delete via `.filter()` to produce a new array, never mutate state directly.
- Parent owns state + update logic; child components receive data and callback functions as props and call them on user interaction.