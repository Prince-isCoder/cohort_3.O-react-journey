import { useState } from 'react'
import Form from './components/Form'
import Navbar from './components/Navbar'
import Usercard from './components/Usercard'

const App = () => {
  const [toggle, setToggle] = useState(true)
  return (
    <div className='p-3 h-screen bg-gray-900 flex flex-col gap-4'>
      <Navbar setToggle={setToggle} />
      {toggle ? (
        <div className='flex'>
          <Usercard />
        </div>
      ) : (
        <div className='flex h-[70%] justify-center items-center'>
          <Form />
        </div>
      )}
    </div>
  )
}

export default App