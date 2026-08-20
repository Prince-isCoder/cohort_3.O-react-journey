import React, { useState } from 'react'

const Web = () => {

    let [formData, setFormData] = useState({})

    console.log(formData)

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    return (
        <div className='h-screen w-full bg-gray-900 p-8'>
            <div className='flex flex-col gap-5 w-60'>
                <input onChange={handleChange} className='border-2 border-white text-white placeholder:text-white' type="text" placeholder='Name' 
                name='name'/>


                <input onChange={handleChange} className='border-2 border-white text-white placeholder:text-white' type="text" placeholder='Email' 
                name='email'/>


                <input onChange={handleChange} className='border-2 border-white text-white placeholder:text-white' type="text" placeholder='Password' 
                name='pass'/>


                <h1 className='text-white'>This is name - {formData.name}</h1>
                <h1 className='text-white'>This is Email - {formData.email}</h1>
                <h1 className='text-white'>This is Password - {formData.pass}</h1>
            </div>
        </div>
    )
}

export default Web
