import React from 'react'
import { useState } from 'react'

const App = () => {

  console.log("App is rendering...")

  let [count, setCount] = useState(0)
  let [user, setUser] = useState(0)

  return (
    <div className='w-full h-screen bg-gray-900 p-8'>
      <h1 className='text-white'>Count is - {count}</h1>
      <h1 className='text-white'>Name is - {user.name}</h1>

      <button onClick={() => {
        setCount(count + 1)
      }} className='border p-2 rounded-lg pr-8 pl-8 bg-white'>Count</button>
      <button onClick={() => {
        user++
      }} className='border p-2 rounded-lg pr-8 pl-8 bg-white'>Name</button>
    </div>
  )
}

export default App
