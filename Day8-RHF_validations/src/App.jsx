import { useState } from 'react'
import Form from './components/Form'
import Navbar from './components/Navbar'
import Usercard from './components/Usercard'

const App = () => {
  const [toggle, setToggle] = useState(false)
  const [users, setUsers] = useState([]);
  return (
    <div className='p-3 h-screen bg-gray-900 flex flex-col gap-4'>
      <Navbar setToggle={setToggle} />
      {toggle ? (
        <div className='flex gap-3'>
          {users.map((elem) => {
            return <Usercard users={elem}/>
          })}
        </div>
      ) : (
        <div className='flex h-[70%] justify-center items-center'>
          <Form setUsers={setUsers} setToggle={setToggle}/>
        </div>
      )}
    </div>
  )
}

export default App