# React — Day 6: Conditional Rendering, Controlled Inputs & Lifting State Up

## 1. Showing one component at a time — ternary rendering

Rendering both `<Login />` and `<Register />` unconditionally would show both at once — not what's wanted. A person is either logging in *or* registering, never both.

```jsx
import Login from './components/Login'
import Register from './components/Register'

const App = () => {
  const [toggle, setToggle] = useState(true)

  return (
    <div className='bg-gray-300 h-screen flex justify-center items-center'>
      {toggle ? <Login /> : <Register />}
    </div>
  )
}
```
`{ }` in JSX evaluates any expression — a ternary (`condition ? a : b`) is exactly that: one expression that resolves to either `<Login />` or `<Register />` depending on `toggle`.

## 2. Passing the toggle down, and why hardcoding `true`/`false` is fragile

```jsx
// Register.jsx
const Register = ({ setToggle }) => {
  return (
    <p>
      Already have an Account | <span onClick={() => setToggle(true)}>Login</span>
    </p>
  )
}
```
```jsx
// Login.jsx
const Login = ({ setToggle }) => {
  return (
    <p>
      Didn't have any Account? <span onClick={() => setToggle(false)}>Register Here</span>
    </p>
  )
}
```
This works, but each child has to **know and hardcode** the exact boolean value that flips it to the other view — `Register.jsx` assumes `true` means "show Login," `Login.jsx` assumes `false` means "show Register." That's brittle: neither component actually knows what `toggle`'s *current* value is, they're just guessing based on what they were told the meaning is supposed to be.

### The fix — functional update, flip whatever it currently is
```jsx
onClick={() => setToggle((prev) => !prev)}
```
Instead of asserting a specific value, this just says **"whatever `toggle` currently is, set it to the opposite."** Same functional-update pattern from the counter/batching lesson — `prev` is guaranteed to be the actual current state, not a guessed value, so this works correctly regardless of which component triggers it or what the state happened to be beforehand.

## 3. Registering users — and the "one step behind" console log

```jsx
const [formData, setFormData] = useState({})
const [users, setUsers] = useState([])

const handleChange = (e) => {
  let { name, value } = e.target
  setFormData({ ...formData, [name]: value })
}

const handleSubmit = (e) => {
  e.preventDefault()
  setUsers([...users, formData])
  console.log(users)
}
```
Submitting the first user (Prince) → console logs `[]` (empty). Submitting the *second* user (Vijay) → console logs an array containing only **Prince's** data — the most recently added user is always missing from what gets logged.

### Why this happens
Calling `setUsers(...)` **schedules** a state update — it doesn't instantly overwrite `users` in the middle of the currently-running function. The `users` variable inside `handleSubmit` is a snapshot from the render that's currently active (a closure over that render's value) — it stays exactly as it was for the *entire* rest of that function call, no matter what you just told React to update it to. `console.log(users)` right after `setUsers(...)` is reading that same stale snapshot, not the freshly computed array. The new value only becomes the "current" `users` on the **next** render — which is exactly why, one submission later, the log shows the *previous* user's data catching up.

> 📝 This is often loosely described as "asynchronous" behavior, and the *symptom* looks that way — but more precisely, it's about **closures and when a re-render happens**, not `setUsers` literally returning a Promise or running on a delay. The value genuinely doesn't update until React re-renders and hands the component fresh state on the next pass.

## 4. One-way vs Two-way binding — controlled inputs

Up to this point, typing into an input **tells** React what changed (`onChange` → `setFormData`) — but React never tells the *input* anything back. That's **one-way communication**: input → React, never React → input.

### Making inputs "controlled" — adding `value`
```jsx
const [formData, setFormData] = useState({
  username: "Prince",
  email: "prince@gmail.com",
  password: 1234
})
```
```jsx
<input value={formData.username} name='username' onChange={handleChange} ... />
<input value={formData.email} name='email' onChange={handleChange} ... />
<input value={formData.password} name='password' onChange={handleChange} ... />
```
Adding `value={formData.x}` makes the input display **whatever React's state currently says it should** — the field is pre-filled from state on render, and any edit still flows back into state via `onChange`. Now the communication runs **both directions**: React → input (via `value`) and input → React (via `onChange`) — this is **two-way binding** (also called a **controlled input**, since React fully controls what the field displays rather than the browser's own internal input state).

### Clean version — empty defaults + reset after submit
```jsx
const [formData, setFormData] = useState({ username: "", email: "", password: "" })
const [users, setUsers] = useState([])

const handleChange = (e) => {
  let { name, value } = e.target
  setFormData({ ...formData, [name]: value })
}

const handleSubmit = (e) => {
  e.preventDefault()
  setUsers([...users, formData])
  setFormData({ username: "", email: "", password: "" })
}
```
```jsx
<input required value={formData.username} name='username' onChange={handleChange} ... />
```
- Starting `formData` empty (instead of pre-filled with a fake user) means the form actually starts blank, as a real registration form should.
- Calling `setFormData({ username: "", email: "", password: "" })` right after adding the user to `users` **clears the form** — since the inputs are controlled (`value={formData.x}`), clearing the underlying state automatically clears what's shown on screen too, no manual DOM reset needed.
- `required` is a plain native HTML attribute here — browser-level validation, unrelated to React state.

## 5. Lifting State Up

The `users` list currently only exists inside `Register.jsx` — but if `App.jsx` (or some sibling component, like a user list display) needs to show or use that data too, it can't reach into `Register.jsx`'s internal state. **Props only flow one direction: parent → child.** A child's own `useState` is private to it.

**The fix:** move the state that needs to be shared **up** to the nearest common parent — here, `App.jsx` — and pass both the data and the updater function *down* as props to whichever children need to read or change it.

```jsx
// App.jsx
const App = () => {
  const [toggle, setToggle] = useState(true)
  const [users, setUsers] = useState([])   // moved up from Register.jsx

  return (
    <div className='bg-gray-300 h-screen flex justify-center items-center'>
      {toggle
        ? <Login setToggle={setToggle} />
        : <Register setToggle={setToggle} users={users} setUsers={setUsers} />}
    </div>
  )
}
```
```jsx
// Register.jsx
const Register = ({ setToggle, users, setUsers }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })

  const handleSubmit = (e) => {
    e.preventDefault()
    setUsers([...users, formData])   // updates the SHARED state, owned by App
    setFormData({ username: "", email: "", password: "" })
  }
  // ...
}
```
`Register.jsx` no longer owns `users` itself — it receives both the current list and the setter as props, and calls the setter exactly like it would its own local state. `App.jsx` (or any other component it renders as a sibling to `Register`) can now also read `users` directly, since it lives at the shared parent level instead of being locked inside one child.

This is the general pattern: **whichever component needs the data most broadly is where the state should actually live** — children below it just receive what they need through props, whether that's the value itself, the setter function, or both.

## Quick Revision
- `{condition ? <A /> : <B />}` — ternary inside JSX for showing exactly one of two components.
- Prefer `setState(prev => !prev)` over hardcoding `setState(true)`/`setState(false)` when a child doesn't actually know the current value.
- Reading state right after calling its setter (in the same function) still gives the **old** value — the update only reflects on the *next* render, due to closures over that render's snapshot.
- Uncontrolled input: only `onChange`, one-way (input → React). Controlled input: `value={state.x}` **and** `onChange`, two-way — React fully drives what's displayed.
- Resetting a controlled form is just resetting its backing state — no manual DOM manipulation needed.
- Lifting state up = moving `useState` to the nearest shared parent, then passing the value and its setter down as props to whichever children need them — because props only travel parent → child, never child → parent or sibling → sibling directly.