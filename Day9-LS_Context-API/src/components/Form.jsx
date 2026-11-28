import React, { use, useState } from 'react'
import { useForm } from 'react-hook-form'
const Form = ({ setUsers, setToggle, users }) => {
    let {
        register,
        handleSubmit,
        reset,
        formState: {
            errors
        } } = useForm({
            mode: "onChange"
        })
    return (
        <div className='flex flex-col gap-6 items-center'>
            <h1 className='font-semibold text-white text-xl'>Create User</h1>
            <form
                onSubmit={handleSubmit((data) => {
                    let userArr = [...users, data]
                    setUsers(userArr)
                    localStorage.setItem("users", JSON.stringify(userArr))
                    setToggle((prev) => !prev)
                    reset();
                })}
                className='w-90 flex flex-col bg-black gap-3 p-4 rounded border-2 border-gray-500'>
                <input
                    {...register("name", {
                        required: "Name is required",
                        pattern: {
                            value: /^\S.*$/,
                            message: "No blank space allowed at beginning"
                        }
                    })}
                    className='p-2 rounded outline-0 border text-white border-gray-500' type="text"
                    placeholder='Name' />
                {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
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
                {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
                <input
                    {...register("mobile", {
                        required: "Mobile is required",
                        minLength: {
                            value: 10,
                            message: "Minimum 10 digits are required"
                        },
                        maxLength: {
                            value: 10,
                            message: "Maximum 10 digits are required"
                        }
                    })}
                    className='p-2 rounded outline-0 border text-white border-gray-500'
                    type="number"
                    placeholder='Mobile' />
                {errors.mobile && <p className='text-red-500'>{errors.mobile.message}</p>}
                <input
                    {...register("image", {
                        required: "Image is required",
                    })}
                    className='p-2 rounded outline-0 border text-white border-gray-500' type="url"
                    placeholder='Image URL' />
                {errors.image && <p className='text-red-500'>{errors.image.message}</p>}
                <button className='text-white cursor-pointer bg-blue-700 rounded-xl p-2'>Add User</button>
            </form>
        </div>
    )
}

export default Form
