Day 8 - React Hook Form Validations

Just create a UI, in which there's a navbar (Navbar.jsx)
Inside navbar, i have created a <button>Create User</button>

Components: 
    ├───Navbar.jsx
    ├───Usercard.jsx
    └───Form.jsx

Purpose: When we click on create user button, the form will appear 
         In form.jsx, i have create a form, with name, email, number, image url, and a <button>Add user </button>

The UI part is done

Now, install the react-hook-form 
        -> npm i react-hook-form

Import inside the Form.jsx
        -> import { useForm } from "react-hook-form"

In the same file (Form.jsx), before return statement
    let data = useForm();
    console.log(data)
In this "data" there are multiple things.

We just need to destructure the needful things

Instead of: 
    let data = useForm();

write: 
    let {register, handleSubmit, reset, formState: {errors}} = useForm();


Before RHF, we had to write onchange={}, name="", values={}, and required. in every input

But register, which is in RHF, contains all of this, just write {...register()}



But it accepts a string, for which input we are using register

{register("name")}
{register("email")}
{register("mobile")}
{register("image")}



Now we have to submit the form, 

So, in form:
    onSubmit={handleSubmit((data) => {
        console.log(data)
    })}

// handleSubmit is from react-hook-form
It also preventing the page from reloading 
That's why we don't need to use e.preventDefault()



Now validations,
When we press Add user button (in Form), it cna print empty data
So we need to apply validations.
We can use required on every input. 
But that is not that good. We need to get full control on what we wanna print

So, we will use react-hook-form validations
Remember in register -> {...register("name")} -> this is not the correct syntax for this

The correct syntax is -> 
    {...register("name", {
        required: "Name is required"
    })}

Now, the empty input field's work is done, like we can't submit the empty form,
but there's more validations we need to remember

Where will the error go, like if we submit the empty fields then there must be some errors generated, 
which we write here
    {...register("name", {
        required: "Name is required"
    })}

So they are passing inside the "errors", which we had destructured from the RHF
So what we will do, if someone tries to submit the empty form, even an empty field.
A small red message should appear below or above the input field

So how can we do it -> Remember errors from RHF
{errors.name && <p classname="text-red-500">Name Daalo</p>}
{errors.email && <p classname="text-red-500">Email Daalo</p>}
Same for the mobile and image

What's happening here -> If we log the errors, it will show the object, and inside the obj all the 
inputs which are empty

Note:- An Empty object is also a truthy value.

So, that's why if the name is empty, then it will add in errors obj, that means it become true, and
in {errors.name && <p></p>}, it will render cause errors are true, and <p> tag will render

We can show, the msg that we have written in register, how -> 
<p>{errors.name.message}</p>
<p>{errors.email.message}</p>
<p>{errors.mobile.message}</p>
<p>{errors.image.message}</p>

{...register("name", {
    required: "Name is required"
})}

In this line "required" check, if the inputs are empty or not.

What if we need to add more validations like, for mobile number: 
    1. Must/Required
    2. Minimum 10 digits
    3. Maximum 10 digits

We will do this inside the register. How -> 
{...register("name", {
    required: "Name is required",
    minLength: {
        value: 10,
        message: "Minimum 10 digits"
    },
    maxLength: {
        value: 10,
        message: "Maximum 10 digits"
    },
})}

#Fun fact: Where we displaying the errors on screen 
    <p>{error.name.message}</p>

It auto detects the error, and show the correct error
Like if input is empty: Mobile is required
Enters 1 digit: Minimum 10 digits are required
Enter 10 digits: No error will display
Enter 11 or more digits: Maximum 10 digits are required



For email validations, go to google/chatgpt/claude/gemini etc, 
and search "Email validations regex"
copy the code: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
then: 
                <input
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Please enter a valid email"
                        }
                    })}
                    className='p-2 rounded outline-0 border text-white border-gray-500' type="email"
                    placeholder='Email' />

Same goes for password validations




All these error are occured when we submit the form, 
But i want to show the errors, when i start typing in real time
and when i pass the validations the error hides,
So what to do

There is a 
    mode: "onChange"
    in useForm()


When we destructured all the neccessary things

    let {
        register,
        handleSubmit,
        reset,
        formState: {
            errors
        } } = useForm({
            mode: "onChange"
        })

This mode: "onChange", helps to show the error in real time


For blank space at beginning in name:
search for the blank space regex online
{...register("name", {
        required: "Name is required",
        pattern: {
        value: /^\S.*$/,
            message: "No blank space allowed at beginning"
            }
})}


For reset the form:
    just call the reset(), inside the handleSubmit()

    onSubmit={handleSubmit((data) => {
        reset();
    })}




Now create array for different users
const [users, setUsers] = useState([])

in handleSubmit:-
    handleSubmit((data) => {
        setUsers([...users, data])
        reset();
    })


Now there's one problem, the Form.jsx is creating users array.
So, we need to render the users as Usercard, and Usercard.jsx is rendering the users
So we have to share the form data to Usercard.jsx

But remember:
    App.jsx
        ├───Navbar.jsx
        ├───Usercard.jsx
        └───Form.jsx

All these components are sibling components, and there's no way we can share the data to siblings directly
So, we will do state lifting up, means: lift the state to the parent

Here state is users[] -> lift this state to parent(App.jsx)

In App.jsx: 
    const [users, setUsers] = useState();

    <Usercard setUsers={setUsers} />

In Form.jsx:
    cosnt Form({setUsers}) {
        return ...
    }

Now there is no "users" in Form.jsx, so we use prev

in submitHandle():
    submitHandle((data) => {
        setUsers((prev) => [...prev, data]);
        reset();
    })

Now we can share the data to Usercard.jsx
we can map through the users:
    In App.jsx: where we render the usercard
    {users.map((elem) => {
        return <Usercard users={users}/>
    })}

In Usercard.jsx:
    const Usercard({users}) => {
        return ...
            {users.name}
            {users.email}
            {users.mobile}
    }


Also share the setToggle to Form.jsx
and in handleSubmit()
    handleSubmit((data) => {
        setUsers((prev) => [...prev, data]),
        setToggle((prev) => !prev),
        reset()
    })


Now we can work on some other functionality, like Update and Delete button 