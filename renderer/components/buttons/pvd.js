
export default function Pvd({ text, action, defaultModel, selected }) {
    const handleClick = () => {
        action(text.toLowerCase());
    }
    return (
        <div onClick={handleClick} className={"hover:bg-[#c5ccdb9a] flex items-center justify-between mt-1 py-[8px] px-2 rounded-md transition-all duration-200 hover:cursor-default " + (selected ? "bg-[#b7becbab]" : "")}>
            <div className=" flex items-center gap-3 h-full w-[90%]">
                <div className="text-sm font-medium">{text}</div>
                { selected && 
                    <>
                        <div className="h-[12px] w-[2px] rounded-full bg-[#2f2f2f47]"></div> 
                        <div className="text-sm text-[#2f2f2fb9] truncate">{defaultModel}</div>
                    </>
                }
            </div>
            <div className=" flex items-center justify-center gap-1 ">
                <div className="bg-[#2f2f2f1d] h-[20px] w-[20px] flex items-center justify-center rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#2f2f2fb9" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    )
}