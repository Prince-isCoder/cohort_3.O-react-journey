import React, { useRef } from 'react'
import Form from './components/Form'
import RHF from './components/RHF'

const App = () => {

  return (
    <div className='bg-gray-900 w-full h-screen flex flex-col gap-4 p-4'>
      <h1 className='text-white'>Hey this is form</h1>
      {/* <Form /> */}
      <RHF />
    </div>
  )
}

export default App
