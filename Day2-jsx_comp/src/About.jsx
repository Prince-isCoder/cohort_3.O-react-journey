let About = ({ name, children }) => {
    console.log(children)

    return <div>
        <h1>Hey I am About</h1>
        { children }
    </div>
}

export default About