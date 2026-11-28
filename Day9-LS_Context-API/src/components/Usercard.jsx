import React from 'react'

const Usercard = ({ users }) => {
    return (
        <div className='group w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-5 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/10 transition-all duration-300'>

            {/* User Profile */}
            <div className='flex items-center gap-4'>
                <div className='h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-700'>
                    <img
                        className='object-cover h-full w-full'
                        src={users.image}
                        alt={users.name}
                    />
                </div>

                <div className='flex flex-col gap-1 min-w-0'>
                    <h1 className='text-white font-semibold text-lg truncate'>
                        {users.name}
                    </h1>
                    <h1 className='text-sm text-zinc-400 break-all'>
                        {users.email}
                    </h1>
                    <h1 className='text-sm text-zinc-400'>
                        {users.mobile}
                    </h1>
                </div>
            </div>

            {/* Divider */}
            <div className='border-t border-zinc-800'></div>

            {/* Actions */}
            <div className='flex justify-between w-full gap-3'>
                <button className='flex-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black font-medium py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer'>
                    Update
                </button>

                <button className='flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-medium py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer'>
                    Delete
                </button>
            </div>
        </div>
    )
}

export default Usercard