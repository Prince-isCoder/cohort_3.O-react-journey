import React from 'react'

const UserCard = ({user}) => {
  return (
    <div className='p-4 flex flex-col gap-4 border-gray-400 border rounded bg-white'>
      <div className='w-50 h-60 rounded overflow-hidden'>
        <img className='w-full' src={user.imageURL} alt="" />
      </div>
      <div>
        <h1>{user.username}</h1>
        <p>{user.email}</p>
      </div>
      <div>
        <button className='w-full bg-red-500 text-white p-2 rounded-lg'>Delete</button>
      </div>
    </div>
  )
}

export default UserCard
