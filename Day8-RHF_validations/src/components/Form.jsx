import React from 'react'

const Form = () => {
  return (
    <div className='flex flex-col gap-6 items-center'>
      <h1 className='font-semibold text-white text-xl'>Create User</h1>
      <form className='w-90 flex flex-col bg-black gap-3 p-4 rounded border-2 border-gray-500'>
        <input className='p-2 rounded outline-0 border text-white border-gray-500' type="text" placeholder='Name'/>
        <input className='p-2 rounded outline-0 border text-white border-gray-500' type="email" placeholder='Email'/>
        <input className='p-2 rounded outline-0 border text-white border-gray-500' type="number" placeholder='Mobile'/>
        <input className='p-2 rounded outline-0 border text-white border-gray-500' type="url" placeholder='Image URL'/>
        <button className='text-white cursor-pointer bg-blue-700 rounded-xl p-2'>Add User</button>
      </form>
    </div>
  )
}

export default Form
