# React — Day 5: Object State, List Rendering & Form Handling

## 1. The problem — updating an object inside `useState`

```jsx
let [count, setCount] = useState(0)
let [user, setUser] = useState({ name: "Prince" })
```
Clicking the **Count** button (`setCount(count + 1)`) updates and re-renders fine — `count` is a **primitive**. Clicking the **Name** button doesn't work the same way, and walking through *why* is the whole lesson here.

### Attempt 1 — pass a plain string
```jsx
onClick={() => setUser("Prince")}
```
❌ Doesn't work as intended — this replaces the entire `user` state with the string `"Prince"`, not an updated object. `user.name` would now break, since `user` is no longer an object at all.

### Attempt 2 — mutate the object directly, don't call the setter
```jsx
onClick={() => { user.name = "Prince" }}
```
❌ Still doesn't render anything new. Technically `user.name` *did* change in memory — but React has no idea, because **nothing told it to re-render**. Without calling `setUser(...)`, React never re-runs the component, so the screen stays exactly as it was.

### Attempt 3 — mutate, then call the setter with no argument
```jsx
onClick={() => {
  user.name = "Prince"
  setUser()
}}
```
❌ Calling `setUser()` with nothing passed in doesn't tell React what the new value actually is.

### Attempt 4 — mutate, then pass the same object back in
```jsx
onClick={() => {
  user.name = "Prince"
  setUser(user)
}}
```
❌ Still doesn't reliably trigger a re-render. This is the trickiest one to understand: **objects are reference types.** `user` is a reference (a pointer to a spot in memory) — mutating `user.name` changes the object at that memory address directly. When you then call `setUser(user)`, you're handing React the exact **same reference** it already had. React's re-render check is essentially "is this a different reference from before?" — and since it isn't, React can conclude nothing actually changed, and may skip re-rendering.

Meanwhile `count` (a primitive) works correctly on every click because primitives don't have this reference problem — `count + 1` always produces a genuinely new value, not a mutated version of the old one.

### The actual fix — replace with a brand-new object
```jsx
onClick={() => {
  setUser({ ...user, name: "Prince" })
}}
```
Instead of mutating the existing object, **spread the old object's contents into a new one**, overriding just the field you want to change. This creates a fresh reference — React sees "this is a different object than before" and re-renders correctly.

### Why did it *always* re-render during all these attempts, then?
You might notice `"App is rendering..."` logs on every click regardless — including some of the broken attempts. That's because passing a **new object literal** (like `{ ...user, name: "Prince" }`, or even accidentally a differently-referenced object each time) always counts as "different" to React's reference check — objects/arrays are compared by reference, not by their contents, so a freshly created object is *always* treated as new, even if its actual field values happen to be identical to before. This is a separate point from the earlier batching lesson (where React skips a re-render only when the *exact same primitive value* is set again) — reference types don't get that same "no-op" optimization by default.

## 2. Primitives vs References inside `useState`

| | Primitive (`useState(0)`) | Reference (`useState({...})` / `useState([...])`) |
|---|---|---|
| Comparison | By value | By reference (memory address) |
| To trigger an update | Any new value works — `count + 1` is automatically "different" | Must create a **new** object/array — mutating the existing one in place won't be detected |
| Example | `setCount(count + 1)` ✅ | `setUser({ ...user, name: "X" })` ✅ / `user.name = "X"` then `setUser(user)` ❌ |

### Mutable vs Immutable — the useful distinction
- **The state "container" itself is treated as immutable** — whether it's a primitive, an object, or an array, you're expected to always produce a *new* value/reference for the setter, never edit the existing one in place.
- **What's *inside* an object or array is mutable in the JS sense** — you technically *can* write `user.name = "X"` — but doing so **bypasses React entirely**; React only reacts to calls to the setter function with a genuinely new reference, not to raw mutations happening in memory that it isn't watching.

## 3. Rendering lists — `.map()` and the `key` prop

```jsx
let arr = [1, 2, 3, 4, 5, 6, 7, 8]

return (
  <div>
    {arr.map((elem, index) => {
      return <Card key={index} />
    })}
  </div>
)
```

### Why does every list item need a `key`?
When React re-renders a list, it needs a fast way to figure out **which rendered element corresponds to which array item** — so it can correctly work out what actually changed: was an item added, removed, or reordered, versus everything just needing a full rebuild from scratch? Without a `key`, React has no reliable way to match "this specific DOM node" to "this specific array entry" across renders, and can end up doing unnecessary re-renders, or worse, mismatching state/content between items when the list changes shape (e.g., an item gets deleted from the middle).

`key` gives React a **stable identity** to track each item by. This is exactly what powers the same efficient diffing behavior from the reconciliation topic — matching Old VDOM entries to New VDOM entries by identity, not just by position.

> ⚠️ **Using the array `index` as `key` (as done above) works, but is a known anti-pattern once the list can change** — if items get added, removed, or reordered, the index-to-item mapping shifts, and React can end up reusing the wrong DOM node for the wrong item (visible as odd bugs: form inputs "remembering" the wrong value after a delete, animations attaching to the wrong item, etc.). It's fine for a genuinely static, never-reordered list like this simple numeric example — but the moment a list is dynamic (like the product-card CRUD from earlier), the `key` should be a stable unique identifier from the data itself (e.g. `product.id`), not the index.

## 4. Form handling — three approaches

### Setup — reading an input's value
```jsx
<input onChange={(e) => console.log(e.target.value)} type="text" placeholder='Name' />
```
`onChange` receives the native event object; `e.target.value` is the current text in that field. But on its own, this doesn't connect to React's rendering system — React only reacts to **state**, and nothing here is calling a setter. Whatever you want React to actually track has to go through `useState`.

### Approach 1 — Brute force (one state per input)
```jsx
let [name, setName] = useState("")
let [email, setEmail] = useState("")
let [pass, setPass] = useState("")

<input onChange={(e) => setName(e.target.value)} ... />
<input onChange={(e) => setEmail(e.target.value)} ... />
<input onChange={(e) => setPass(e.target.value)} ... />
```
Works, but doesn't scale — a form with 100 fields would need 100 separate `useState` calls.

### Approach 2 — Better (one object, but still repetitive)
```jsx
let [formData, setFormData] = useState({})

<input onChange={(e) => {
  setFormData({ ...formData, name: e.target.value })
}} ... />
```
> ⚠️ A common early mistake here: calling `setFormData(e.target.value)` directly (passing just the raw string, not merged into an object) replaces the *entire* `formData` state with a plain string — so instead of `{ name: "Prince", email: "", pass: "" }`, you'd get just `"Prince"` on its own. The fix is the same principle as the `user`/object problem above: spread the old state (`...formData`) into a new object, and only override the specific field that changed.

This version works correctly — but still repeats near-identical `onChange` logic for every single input, one hardcoded field name per handler. Breaks the **DRY** principle (Don't Repeat Yourself), and still doesn't scale to many fields.

### Approach 3 — Optimal (one handler for every input)
```jsx
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value })
}

<input onChange={handleChange} name='name' ... />
<input onChange={handleChange} name='email' ... />
<input onChange={handleChange} name='pass' ... />
```
One single `handleChange` function, reused by every input. Each `<input>` gets a `name` attribute matching the field it represents in `formData` — `handleChange` uses that to figure out **which** key to update, dynamically.

### Why `[e.target.name]` needs the square brackets
This is a JavaScript feature called a **computed property name**, and it isn't React-specific — it works in any object literal:
```js
let key = "name"
let obj = { [key]: "Vijay" }   // obj is now { name: "Vijay" }
```
Without the brackets, `{ e.target.name: e.target.value }` would be interpreted as a literal property key spelled `e.target.name` — which isn't valid JS syntax at all, since object keys before `:` are normally written as plain identifiers or strings, not full expressions. Wrapping it in `[ ]` tells JS: *"don't treat this as a literal key name — evaluate this expression first, and use whatever value it produces as the key."*

So `{ ...formData, [e.target.name]: e.target.value }` reads as: *"take everything already in `formData`, and set whichever key `e.target.name` currently evaluates to — `"name"`, `"email"`, or `"pass"`, depending on which input fired the event — to the new typed value."* This is exactly what lets one function correctly update any field, based purely on which `<input>` triggered it.

For comparison, this is the same underlying mechanism as:
```js
let obj = { name: "Prince" }
obj.name = "Vijay"      // dot notation — key is a fixed, known-in-advance identifier
obj["name"] = "Vijay"   // bracket notation — key can be ANY expression, including a variable
```
`e.target.name` is a **variable value**, not a fixed identifier known ahead of time — so only the bracket form can use it as a key.

## Quick Revision
- Objects/arrays in state are compared **by reference** — mutating in place and passing the same reference back won't trigger a re-render; always build a new object/array (`{ ...old, key: newValue }`).
- Primitives are compared **by value** — any new value naturally counts as different.
- `.map()` needs a `key` per item so React can track identity across re-renders; array index works for static lists, but use a stable unique ID (like a DB `id`) for anything that can be reordered/added/removed.
- Form handling progression: one state per field (doesn't scale) → one object state, but repeated setter calls per input (breaks DRY) → one object state + one shared `handleChange`, using each input's `name` attribute and computed property syntax `[e.target.name]` to update the right key dynamically. 