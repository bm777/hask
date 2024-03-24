import { useTheme } from "next-themes";
export default function Pvd({ text, action, defaultModel, selected }) {
    const { theme } = useTheme();
    
    const handleClick = () => {
        action(text.toLowerCase());
    }
    return (
        <div onClick={handleClick} className={"flex items-center justify-between mt-1 p-2 rounded-md transition-all duration-200 hover:bg-light-secondary/60 hover:cursor-default dark:hover:bg-neutral-400/10 " + (selected ? "bg-light-secondary/60 dark:bg-neutral-400/10" : "")}>
            <div className=" flex items-center gap-3 h-full w-[90%]">
                <div className="text-sm font-medium text-grayish/60 dark:text-dark-text">{text === "Openai" ? "OpenAI" : text }</div>
                { selected && 
                    <>
                        <div className="h-3 w-[2px] rounded-full bg-grayish/30"></div> 
                        <div className="text-sm text-grayish/70 dark:text-dark-text/50 truncate">{defaultModel}</div>
                    </>
                }
            </div>
            <div className=" flex items-center justify-center ">
                <div className="bg-grayish/10  h-6 w-6 flex items-center justify-center rounded-md border border-neutral-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={theme==="light" ?"#2f2f2fb9":"#8181814b"} className="w-4 h-4">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    )
}