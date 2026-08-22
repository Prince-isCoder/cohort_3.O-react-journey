import React, { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import UserCard from './components/UserCard'

const App = () => {

  const [toggle, setToggle] = useState(false)
  const [users, setUsers] = useState([])

  console.log(users)

  return (
    <div className='bg-gray-900 h-screen flex justify-center items-center'>
      <Register setUsers={setUsers} setToggle={setToggle} />

      <div>
        {users.map((elem) => <UserCard user={elem} />)}
      </div>
    </div>
  )
}

export default App
