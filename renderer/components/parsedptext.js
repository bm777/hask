import React from "react"
import { useEffect, useState } from "react"

const ParsedText = React.memo(({ children }) => {
    const [formattedLines, setFormattedLines] = useState([])
    
    useEffect(() => {
        if (children) {
        // const lines = children.split("\n")
        console.log(children)
        // setFormattedLines(children)
        }
    }, [children])

    if (children === "") {
        return <br/>
    }
    
    return (
        <>
            <span key={"index"}>{children}</span>
        </>
    )
})

export default ParsedText