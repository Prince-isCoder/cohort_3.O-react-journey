import React from 'react'

const ProductCard = ({ product, deleteCard }) => {
    return (
        <div className='p-2 border-2 border-white rounded flex flex-col gap-2'>
            <div className='w-50'>
                <img className='rounded' src={product.image} alt="" />
            </div>
            <div className='text-white flex flex-col gap-1 w-full'>
                <h2 className='font-semibold text-xl'>{product.title.substring(0, 20)}</h2>
                <p className='text-xs text-gray-300'>{product.category}</p>
                <p className='text-emerald-400'>${product.price}</p>
            </div>

            <button onClick={() => deleteCard(product.id)} className='p-2 bg-red-600 text-white rounded flex w-full justify-center'>Delete</button>
        </div>
    )
}

export default ProductCard
