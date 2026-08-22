import React from 'react'
import { useState } from 'react'

const Register = ({ setToggle, setUsers }) => {

    const [formData, setFormData] = useState({ username: "", email: "", password: "", imageURL: "" })

    const handleChange = (e) => {
        let { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setUsers((prev) => [...prev, formData])
        setFormData({ username: "", email: "", password: "", imageURL: "" })
    }
    

    return (
        <div className='bg-white w-96 p-4 rounded-lg flex flex-col gap-4 justify-center'>
            <h1 className='font-semibold'>Register</h1>
            <form onSubmit={handleSubmit} action="" className='flex flex-col gap-4'>
                <input required value={formData.username} name='username' onChange={handleChange} className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Username' />
                <input required value={formData.email} name='email' onChange={handleChange} className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Email' />
                <input required value={formData.password} name='password' onChange={handleChange} className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Password' />
                <input required value={formData.imageURL} name='imageURL' onChange={handleChange} className='p-2 border border-gray-400 rounded-lg' type="url" placeholder='Image URL' />
                <button className='bg-blue-600 text-white p-2 rounded-lg'>Register</button>
            </form>
            <p className='w-full flex justify-center gap-2'>
                Already have an Account | <span onClick={() => {
                    setToggle((prev) => !prev)
                }} className='font-semibold text-blue-600 cursor-pointer'>Login</span>
            </p>
        </div>
    )
}

export default Register
