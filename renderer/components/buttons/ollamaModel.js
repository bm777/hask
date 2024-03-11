import { useState } from "react"

export default function OllamaModel({ name, description, active, action}) {
    const [downloaded, setDownloaded] = useState(false)

    const handleClick = () => { 
        action(name)
    }
    return (
        <div onClick={handleClick} className="w-full h-12 flex items-center justify-center my-1 hover:cursor-default ">
            <div className={"border w-[98%] h-full rounded-md bg-[#4d4e5016] flex flex-col px-2 pt-1 hover:border-[#81818183] relative " + (active ? "border-[#81818183] bg-[#4d4e505c]" : "border-[#8181811f]")}>
                <span className="text-[#2f2f2fa3] dark:text-[#A7A6A8]">{name}</span>
                <span className="text-xs text-[#2f2f2f69] dark:text-[#a7a6a8a2] truncate">{description}</span>

                <div className=" absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center">
                    {
                        downloaded &&
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FF5F57" viewBox="0 0 256 256" className="w-4 h-4">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                    }
                </div>
            </div>
            
        </div>
    )
}