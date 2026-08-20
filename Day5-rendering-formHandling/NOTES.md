# React Day 5 — Rendering & Form Handling

## Why UI doesn't update on mutation
React re-render trigger = call setFunction, not variable change. Direct assign (`count = 5`) never re-renders — React don't watch normal vars, only state.

Click Count button → `setCount(count+1)` → works, UI updates instantly.
Click Name button → `user.name = "Prince"` alone → nothing happens on screen, even though value changed in memory. Why: changing object property mutates existing object in place — memory address (reference) stays same. React compares old state ref vs new state ref to decide re-render; same ref = React thinks "nothing changed," skips render.

Attempts that fail, in order:
1. `user.name = "Prince"` — mutated, no setFunction called at all → no re-render.
2. `user.name = "Prince"; setUser()` — setFunction called but empty, no value passed → sets state to `undefined`.
3. `user.name = "Prince"; setUser(user)` — value passed, but `user` is same reference as before → React sees same object → still may not visually differ / still bad practice, breaks pure-immutability model.

Fix: build brand new object → `setUser({...user, name: "Prince"})`. Spread copies old keys into fresh object, new key overrides `name`. New object = new memory reference = React detects change = re-render fires.

Side note on why console log fires every click even when overwriting same name: because object identity changes every time (`{...}` creates new ref each call), so React always treats it as "different state," re-renders regardless of whether visible value differs. Compare to primitives — passing same number to setCount would skip re-render (batching optimization for primitive equality check).

## Primitive vs Reference states
Primitives (number, string, boolean):
- Stored by value.
- `useState` replaces old value entirely and cleanly every set call.
- Doing `user++` where user is primitive number does NOT mutate the state variable directly either (JS primitives fully immutable) — but even conceptually, without calling `setUser`, no render happens regardless of primitive or object.

Reference types (object, array):
- Stored by reference (pointer to memory location).
- Mutating inner property doesn't change the pointer/address.
- React's change-detection is reference-equality based (`Object.is` under hood), not deep value comparison — so shallow mutation invisible to React.
- Golden rule: never mutate state object/array directly. Always construct new one via spread `{...obj}` / `[...arr]`, then pass to setFunction.

Immutable vs Mutable summary:
- Immutable = primitives; can't be altered, only replaced; `useState` box itself always swapped fresh.
- Mutable = objects/arrays; data inside changeable, but changing it silently doesn't trigger react; must recreate the wrapping object/array for react to notice.

## Keys in list rendering
`.map()` output needs `key` prop on each element (`<Card key={index}/>`).
Reason: React uses keys internally to match list items across renders — figure out which items added, removed, reordered, or unchanged, instead of re-building/re-rendering whole list from scratch every time. Without key, React falls back to index-based diffing by position only, which breaks badly when list order changes (item state can attach to wrong element after insert/delete). Using stable unique id as key is safer than array index when list can reorder/filter; index is fine for static, non-reorderable lists.

## Form Handling — the 3 approaches, in depth

### 1. Brute force
Separate `useState` per field:
```
let [name, setName] = useState("")
let [email, setEmail] = useState("")
let [pass, setPass] = useState("")
```
Each input's `onChange` calls its own setter with `e.target.value`.
Works fine for small forms. Doesn't scale — 100 fields = 100 states, 100 handlers, unmanageable.

### 2. Better approach — single object state
Combine all fields into one state object: `useState({name:"", email:"", pass:""})`.

Naive wrong version: `setFormData(e.target.value)` — replaces entire state with just the typed string, wiping other fields (state = "Prince" instead of `{name:"Prince", email:"", pass:""}`). Wrong because setFunction fully replaces state, doesn't merge automatically (unlike class-component `this.setState` which merges).

Correct version uses spread to preserve old fields: `setFormData({...formData, name: e.target.value})`. Spread unpacks existing key-values first, then the explicit `name:` key overwrites just that one property. Still leaves problem: separate onChange handler needed per input (`name` one, `email` one, `pass` one) → code duplication, breaks DRY principle.

### 3. Optimal approach — single reusable handler
One shared function for every input:
```
const handleChange = (e) => {
  setFormData({...formData, [e.target.name]: e.target.value})
}
```
Each `<input>` gets matching `name` attribute (`name='name'`, `name='email'`, `name='pass'`) — this is plain HTML input `name` attr, not related to state var name, just a label React reads via `e.target.name`.

Computed property key `[e.target.name]` — square brackets tell JS "evaluate what's inside as expression, use result as the property key," not literal text "e.target.name". So if `e.target.name` equals `"email"`, this becomes exactly `{...formData, email: e.target.value}` at runtime dynamically. Same result achievable both ways:
```
obj.email = "x"       // dot notation, key hardcoded literal
obj["email"] = "x"    // bracket notation, key can be literal OR variable
```
Dot notation only accepts a fixed literal property name written directly in code — can't substitute a variable. Bracket notation accepts any expression (variable, function call, string) evaluated to get the key name — that's why dynamic/generic handlers require bracket syntax, since the field being changed differs per call and isn't known ahead of time.

This collapses N handlers into 1, satisfies DRY, scales to any number of fields without new code.

## Recap
- Re-render fires only on setFunction call with new reference/value, never on silent mutation.
- Primitives replace cleanly; objects/arrays need spread-and-replace pattern.
- Keys in `.map()` let React efficiently diff lists.
- Form state evolves brute force → merged object w/ spread → single dynamic handler w/ computed key, each step removing repetition.