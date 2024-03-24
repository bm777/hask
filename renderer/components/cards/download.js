import { useTheme } from "next-themes";
import { useState } from "react";

export default function download({label, action}) {
    const { theme } = useTheme()

    const handleDownload = async () => {
        if (label === "Up to date") return
        action()
    }

    return (
        <div onClick={handleDownload} className="flex items-center h-6 rounded-md gap-1 px-[6px] bg-grayish/10 hover:cursor-pointer border border-gray-600/30 dark:bg-3">
            {
                label === "Up to date" ?
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF5F57" className="h-[14px] w-[14px]">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" fill='none' viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"#FF5F57":"#FF5F57"} className="h-[14px] w-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    
            }
            
            <span className="text-xs text-rose dark:text-rose">{label}</span>
        </div>
    )
}