import React from "react"
import { useEffect, useState } from "react"

const ParsedText = React.memo(({ children }) => {
    const [formattedLines, setFormattedLines] = useState([])
    
    useEffect(() => {
        if (children) {

        }
    }, [children])

    if (children === "") {
        return <br/>
    }
    
    return (
        <>
            <span className="border border-green-600">
                {
                <span key={"index"}>
                    {children}
                </span>
                }
            </span>
        </>
    )
})

export default ParsedText