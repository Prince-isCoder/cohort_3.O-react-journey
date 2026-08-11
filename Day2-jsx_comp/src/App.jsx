import About from './About'

let App = (props) => {
  return <div>
    <h1>Hello</h1>
    <h2>Bye</h2>
    <h3>Come again</h3>
    <About name="Prince" elem={<p>Hello this is p</p>}>
      <h1>
        Hello I am children
      </h1>
    </About>
  </div>
}

export default App