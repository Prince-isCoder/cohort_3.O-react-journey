import React, { useState } from 'react'

const Counter = () => {

    console.log("Counter is rendering")
    let [count, setCount] = useState(0)
    console.log(count)

  return (
    <div className=''>
      <h1>Count - {count}</h1>
      <button onClick={() => {
        setCount((prev) => prev + 1)
        setCount((prev) => prev + 1)
        setCount((prev) => prev + 1)
      }}>Increment</button>
    </div>
  )
}

export default Counter
