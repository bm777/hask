import { useTheme } from "next-themes";

export default function ModelItem({ category, label}) {
    const { theme } = useTheme()

    return (
        <div className="flex items-center h-6 rounded-md gap-1 px-[6px] bg-grayish/10 border border-gray-600/30 dark:bg-neutral-400/10">
            {
                category === "family" &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fa3":"#A7A6A8"} viewBox="0 0 256 256" className="h-[18px] w-[18px]">
                        <path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-64,80h64v16H136Zm0-16V88h64v16Zm0,48h64v16H136Zm64-80H136V56h64ZM56,56h64V200H56ZM200,200H136V184h64v16Z"></path>
                    </svg>
            }
            {
                category === "params" &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fa3":"#A7A6A8"} viewBox="0 0 256 256" className="h-[16px] w-[16px]">
                        <path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"></path>
                    </svg>
            }
            {
                category === "q" &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fa3":"#A7A6A8"} viewBox="0 0 256 256" className="h-[16px] w-[16px]">
                        <path d="M170.34,85.66a8,8,0,0,1,11.32-11.32L192,84.69V48a8,8,0,0,1,16,0V84.69l10.34-10.35a8,8,0,0,1,11.32,11.32l-24,24a8,8,0,0,1-11.32,0ZM224,144H187.5L96.26,45.15A16.06,16.06,0,0,0,84.5,40H32A16,16,0,0,0,16,56V96a16,16,0,0,0,16,16H68.5l91.24,98.85A16.06,16.06,0,0,0,171.5,216H224a16,16,0,0,0,16-16V160A16,16,0,0,0,224,144Z"></path>
                    </svg>
            }
            {
                category === "size" &&
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fa3":"#A7A6A8"} viewBox="0 0 256 256" className="h-[15px] w-[15px]">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,88V44l44,44Z"></path>
                </svg>
            }
            <span className="text-xs text-[#2f2f2fa3] dark:text-[#A7A6A8]">{label}</span>
        </div>
    )
}