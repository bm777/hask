import React from "react"
import { useEffect, useState } from "react"

const ParsedText = React.memo(({ children, searching }) => {
    const [formattedLines, setFormattedLines] = useState([])
    
    useEffect(() => {
        if (children) {
            const parts = (children).split("**");
            const formattedText = parts.map((part, index) => {
                if (index % 2 === 0) {
                    return <span key={index} className="flex items-center "> { part } </span>; // Normal text
                } else {
                    return <span key={index} className="font-bold">{part}</span>; // Bold text
                }
            });
            setFormattedLines(formattedText);
        }
        
    }, [children])

    if (children === "") {
        return <br/>
    }
    
    return (
        <>
            <span className="text-base">
                {
                <span key={"index"} className="">
                    {
                        formattedLines
                    }
                </span>
                }
            </span>
        </>
    )
})

export default ParsedText