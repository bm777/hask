export default function Model({ selected, text , action}) {
    const handleClick = () => {
        action(text)
    }
    return (
        <div onClick={handleClick} className={"hover:bg-[#c5ccdb9a] flex items-center justify-between mt-1 py-[8px] px-2 rounded-md transition-all duration-200 hover:cursor-default "  + (selected ? "bg-[#c5ccdb9a]" : "")}>
            <div className=" flex items-center justify-center gap-1">
                <div className="">
                    {
                        selected ?
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#2f2f2fa3" className="w-5 h-5">
                            <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2f2f2fa3" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                        </svg> 
                    }
                </div>
                <div className={"text-sm " + (selected ? "font-medium" : "")}>{text}</div>
            </div>
            <div className=" "> </div>
        </div>
    )
}