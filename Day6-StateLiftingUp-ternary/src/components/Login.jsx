import React from 'react'

const Login = ({ setToggle }) => {
    return (
        <div className='bg-white w-96 p-4 rounded-lg flex flex-col gap-4 justify-center'>
            <h1 className='font-semibold'>Login</h1>
            <form action="" className='flex flex-col gap-4'>
                <input className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Email' />
                <input className='p-2 border border-gray-400 rounded-lg' type="text" placeholder='Password' />
                <button className='bg-blue-600 text-white p-2 rounded-lg'>Login</button>
            </form>
            <p className='w-full flex justify-center gap-2'>
                Didn't have any Account? <span
                onClick={() => {
                    setToggle((prev) => !prev)
                }}
                className='font-semibold text-blue-600 cursor-pointer'>Register Here</span>
            </p>
        </div>
    )
}

export default Login
