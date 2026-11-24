import React from 'react'

const Usercard = () => {
    return (
        <div className='p-4 border border-purple-500 rounded flex flex-col gap-4'>
            <div className='h-30 w-30'>
                <img
                className='object-fit h-full w-full rounded-xl'
                    src="https://i.pinimg.com/736x/e5/2c/ec/e52cecdc442ed6eb12543ca9a54f1540.jpg"
                    alt="" />
            </div>
            <div className='flex flex-col text-white gap-1'>
                <h1>Name</h1>
                <h1 className='text-sm'>Email</h1>
                <h1 className='text-sm'>Contact</h1>
            </div>
            <div className='flex justify-between w-full gap-4'>
                <button className='bg-yellow-700 text-white py-2 px-3 rounded'>Update</button>
                <button className='bg-red-700 text-white py-2 px-3 rounded'>Delete</button>
            </div>
        </div>
    )
}

export default Usercard
