import React from 'react'
import { useForm } from 'react-hook-form'

const RHF = () => {

    let { register, handleSubmit, reset, formState: { errors } } = useForm()

    return (
        <div className='w-80 cla'>
            <form
            onSubmit={handleSubmit((data) => {
                console.log(data)
                reset()
            })}
                className='flex flex-col gap-4 p-6 rounded-lg bg-white'>
                <h1>React Hook Form</h1>

                <input
                    {...register("productName")}
                    id='product-name'
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Product Name' />

                <input
                    {...register("price")}
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Price' />

                <input
                    {...register("category")}
                    className='p-2 border border-gray-400 rounded-lg'
                    type="text"
                    placeholder='Category' />

                <input
                    {...register("imgURL")}
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

export default RHF
