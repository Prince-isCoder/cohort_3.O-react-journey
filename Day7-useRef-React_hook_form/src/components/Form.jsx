import React, { useRef, useState } from 'react'

const Form = () => {

    let formRef = useRef({})

    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log(formRef)
        console.log(formRef.current.productName.value)
        console.log(formRef.current.price.value)
        console.log(formRef.current.category.value)
        console.log(formRef.current.imageURl.value)
    }

    return (
        <div className='w-80 cla'>
            <form
                onSubmit={handleSubmit}
                className='flex flex-col gap-4 p-6 rounded-lg bg-white'>

                <input
                    ref={(e) => (formRef.current.productName = e)}
                    id='product-name'
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Product Name' />

                <input
                    ref={(e) => (formRef.current.price = e)}
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Price' />

                <span>Select Category: </span>

                <select
                    ref={(e) => (formRef.current.category = e)}
                    className='p-2 border border-gray-400 rounded-lg'>
                    <option value="#">Select</option>
                    <option value="Mens">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                </select>

                <input
                ref={(e) => (formRef.current.imageURl = e)}
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Image URL' />

                <button
                    className='p-2 text-white bg-blue-600 rounded-lg'>
                    Create</button>

            </form>
        </div>
    )
}

export default Form
