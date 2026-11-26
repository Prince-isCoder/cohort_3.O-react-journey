# React — Day 8: React Hook Form Validations
 
## 1. Setup — the UI first
 
```
components/
  Navbar.jsx
  UserCard.jsx
  Form.jsx
```
`Navbar.jsx` holds a `<button>Create User</button>` that toggles `Form.jsx` visible. `Form.jsx` has the actual form: name, email, number, image URL, and an `<button>Add User</button>`.
 
```
npm i react-hook-form
```
```jsx
import { useForm } from "react-hook-form"
```
 
## 2. `useForm()` and destructuring what's needed
 
```jsx
let data = useForm()
console.log(data)
```
Logs a large object with everything needed to manage the form. Instead of taking the whole thing, destructure only what's actually used:
```jsx
let { register, handleSubmit, reset, formState: { errors } } = useForm()
```
 
## 3. `register` replaces manual wiring
 
Before RHF, every input needed its own `onChange`, `name`, `value`, and `required` written by hand (see Day 5/6). `register` bundles all of that into one spreadable object — just give it the field's name as a string:
```jsx
{...register("name")}
{...register("email")}
{...register("mobile")}
{...register("image")}
```
 
## 4. Submitting the form
 
```jsx
<form onSubmit={handleSubmit((data) => {
  console.log(data)
})}>
```
`handleSubmit` comes from RHF — it wraps the callback, collects all registered field values into `data`, and **already calls `preventDefault()` internally**, so there's no need to write `e.preventDefault()` separately, unlike the vanilla form handling from Day 5.
 
## 5. Validation rules — the correct `register` syntax
 
Using plain HTML `required` on every input works but gives no real control over the message or the exact rule. RHF's own validation goes as a **second argument** to `register`:
```jsx
{...register("name", {
  required: "Name is required"
})}
```
 
### Where the error actually goes
Each validation failure is collected into the `errors` object (destructured from `formState` above) under the field's name:
```jsx
{errors.name && <p className="text-red-500">Name Daalo</p>}
```
> ⚠️ Correction: `classname` is not a valid JSX attribute — it must be `className` (camelCase), same rule covered back in Day 2/3. Using `classname` silently does nothing; React won't apply any styling, and in strict environments it can also trigger a console warning about an unrecognized DOM attribute.
 
**Why `errors.name && <p>...</p>` works:** `errors.name` is only populated when that field actually has a validation failure. An **empty object `{}` is still truthy** in JavaScript — so once `name` fails validation, `errors.name` holds an object (truthy) rather than being `undefined` (falsy), and the `&&` short-circuit renders the `<p>` only in that case.
 
### Showing RHF's own message instead of a hardcoded string
Rather than writing a fixed message in JSX, use the message that was actually configured in `register`:
```jsx
<p>{errors.name.message}</p>
<p>{errors.email.message}</p>
<p>{errors.mobile.message}</p>
<p>{errors.image.message}</p>
```
 
## 6. Multiple rules on one field
 
```jsx
{...register("mobile", {
  required: "Mobile is required",
  minLength: {
    value: 10,
    message: "Minimum 10 digits"
  },
  maxLength: {
    value: 10,
    message: "Maximum 10 digits"
  },
})}
```
RHF automatically picks whichever rule actually failed and surfaces **that specific message** through `errors.mobile.message` — no manual branching needed:
- Empty → "Mobile is required"
- 1–9 digits → "Minimum 10 digits"
- Exactly 10 digits → no error
- 11+ digits → "Maximum 10 digits"
> 📝 Note: `minLength`/`maxLength` check the **string length** of what's typed, not a numeric value comparison — this matters for a `type="number"` or `type="tel"` field where "10 digits" really means "10 characters," which is exactly what's wanted here for a mobile number.
 
## 7. Pattern validation — email & leading whitespace
 
For anything beyond length, use `pattern` with a regex:
```jsx
<input
  {...register("email", {
    required: "Email is required",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email"
    }
  })}
  className='p-2 rounded outline-0 border text-white border-gray-500'
  type="email"
  placeholder='Email'
/>
```
> 📝 Writing a fully correct email regex from scratch is a known rabbit hole (RFC 5322 technically allows far more than most patterns account for) — looking up a well-tested pattern rather than hand-rolling one is standard practice, not a shortcut to be embarrassed about.
 
Same mechanism for rejecting a leading blank space in a name:
```jsx
{...register("name", {
  required: "Name is required",
  pattern: {
    value: /^\S.*$/,
    message: "No blank space allowed at beginning"
  }
})}
```
`^\S.*$` reads as: the **first character** (`^\S`) must be a non-whitespace character, followed by anything else (`.*`) to the end (`$`) — so a string starting with a space fails the pattern, but internal spaces later in the string are fine.
 
## 8. Real-time validation — `mode: "onChange"`
 
By default, RHF validates on submit. To show/hide errors as the user types (instead of waiting for a submit attempt), pass a `mode` option into `useForm()`:
```jsx
let {
  register,
  handleSubmit,
  reset,
  formState: { errors }
} = useForm({
  mode: "onChange"
})
```
With this set, `errors.fieldName` updates on every keystroke — the red message appears as soon as a rule fails and disappears the moment the input becomes valid again, without needing to submit first.
 
## 9. Resetting the form after submit
 
```jsx
onSubmit={handleSubmit((data) => {
  reset()
})}
```
`reset()` — also destructured from `useForm()` — clears all registered fields back to their defaults. Same end goal as `form.reset()` from the vanilla-JS version in Day 5, just RHF's own method instead of the native DOM one.
 
## 10. Storing submitted users
 
```jsx
const [users, setUsers] = useState([])
 
handleSubmit((data) => {
  setUsers([...users, data])
  reset()
})
```
Same pattern from Day 5/6 — spread the existing array, append the new entry, never mutate `users` directly.
 
## 11. Sharing the data — state lifting up, again
 
`Form.jsx` builds the `users` array, but `UserCard.jsx` is the component that needs to **display** it. Looking at the component tree:
```
App.jsx
 ├── Navbar.jsx
 ├── UserCard.jsx
 └── Form.jsx
```
`Form.jsx` and `UserCard.jsx` are **siblings** — and as covered in Day 6, there's no direct way for one sibling to hand data to another. Props only travel parent → child. So the state has to move **up** to the shared parent, `App.jsx` (the exact same "lifting state up" principle from Day 6, just applied to a different pair of components).
 
```jsx
// App.jsx
const [users, setUsers] = useState([])
 
<Form setUsers={setUsers} />
{users.map((elem) => <UserCard key={elem.id ?? elem.email} user={elem} />)}
```
> ⚠️ Correction: the original draft wrote `<Usercard users={users}/>` **inside** the `.map()` callback and had `Usercard` destructure `{ users }` — that passes the **entire array** to every single card, not just that card's own data. The map callback's parameter (`elem`) is the individual user for that iteration — it should be passed as a singular prop (`user={elem}`), and `UserCard` should destructure `{ user }`, not `{ users }`. Also, every item rendered via `.map()` needs a stable **`key`** (see Day 5) — using the user's own `id` or `email` if present, since array index is fragile once users can be deleted or reordered.
 
```jsx
// Form.jsx
const Form = ({ setUsers, setToggle }) => {
  // ...
  handleSubmit((data) => {
    setUsers((prev) => [...prev, data])
    setToggle((prev) => !prev)
    reset()
  })
}
```
Since `users` no longer lives locally in `Form.jsx`, the **functional update** form (`prev => [...prev, data]`) is used instead of referencing a `users` variable that doesn't exist in this component anymore — same functional-update principle from Day 4/6, just necessary here because the setter was handed down as a prop without its paired state value.
 
```jsx
// UserCard.jsx
const UserCard = ({ user }) => {
  return (
    <div>
      <p>{user.name}</p>
      <p>{user.email}</p>
      <p>{user.mobile}</p>
    </div>
  )
}
```
 
`setToggle` is also passed down to `Form.jsx` so that submitting the form can close it automatically — same `prev => !prev` toggle pattern from Day 6, applied here to hide the form once a user is successfully added.
 
## 📌 Interview Notes
- **Q: What problem does `register()` solve?** It replaces manually wiring `name`, `value`, `onChange`, and validation attributes on every input — one call generates all of that, spread directly onto the element.
- **Q: Why doesn't a React Hook Form submit handler need `e.preventDefault()`?** `handleSubmit` (from `useForm()`) already calls it internally before running the provided callback.
- **Q: How does RHF know which validation message to show?** Each rule (`required`, `minLength`, `maxLength`, `pattern`) carries its own `message`; RHF surfaces whichever rule actually failed through `errors.fieldName.message`.
- **Q: Why does `errors.name && <p>...</p>` work even though `errors.name` is an object, not a boolean?** Any non-empty (and even empty `{}`) object is truthy in JS — `errors.name` only exists at all when that field has failed validation, so its mere presence is enough for the `&&` check to pass.
- **Q: What does `mode: "onChange"` change?** Validation runs (and `errors` updates) on every keystroke instead of only on submit attempts.
## Quick Revision
- `register("fieldName", { rules })` replaces manual `name`/`value`/`onChange`/`required` wiring on an input.
- `handleSubmit(callback)` auto-prevents default and hands the callback the collected form data.
- Validation rules (`required`, `minLength`, `maxLength`, `pattern`) each carry their own message, read via `errors.fieldName.message`.
- `mode: "onChange"` in `useForm()` switches validation from submit-only to real-time.
- `reset()` clears the form after submit — RHF's equivalent of the native `form.reset()`.
- Sibling components (`Form.jsx` ↔ `UserCard.jsx`) still can't share state directly — lift it to the common parent (`App.jsx`) and pass data/setters down as props, same principle as Day 6.
- When a setter is passed down without its paired state value, use the functional update form (`prev => [...prev, data]`) instead of referencing a local variable that no longer exists in that component.
- Every `.map()`-rendered list still needs a stable `key` — pass the individual item (`user={elem}`), not the whole array, to each child.
 