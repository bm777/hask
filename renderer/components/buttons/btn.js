import { useTheme } from "next-themes"
export default function Btn({ type, text, action }) {
    const { theme } = useTheme()

    if(type==="settings")
        return (
            <div onClick={() => action("discord")} className="hover:bg-[#c5ccdb9a] flex items-center justify-between mt-1 py-[8px] px-2 rounded-md transition-all duration-200 hover:cursor-default dark:hover:bg-[#2C2B2F]">
                <div className="flex items-center justify-center gap-1">
                    <div className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ? "#2f2f2fa3": "#A7A6A8"} className="w-[20px] h-[20px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                        </svg>
                    </div>
                    <div className="text-sm text-[#2f2f2f] dark:text-[#A7A6A8] ">{text}</div>
                </div>
                <div className=" flex items-center justify-center gap-1 ">
                    <div className="bg-[#2f2f2f1d] h-[24px] w-[24px] flex items-center justify-center rounded-md border border-[#8181814b] dark:bg-[#414045]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fb9":"#ACABAE"} viewBox="0 0 256 256" className="w-4 h-4">
                            <path d="M180,144H160V112h20a36,36,0,1,0-36-36V96H112V76a36,36,0,1,0-36,36H96v32H76a36,36,0,1,0,36,36V160h32v20a36,36,0,1,0,36-36ZM160,76a20,20,0,1,1,20,20H160ZM56,76a20,20,0,0,1,40,0V96H76A20,20,0,0,1,56,76ZM96,180a20,20,0,1,1-20-20H96Zm16-68h32v32H112Zm68,88a20,20,0,0,1-20-20V160h20a20,20,0,0,1,0,40Z"></path>
                        </svg>
                    </div>
                    <div className="bg-[#2f2f2f1d] flex items-center justify-center rounded-md border border-[#8181814b] h-[24px] w-[24px] dark:bg-[#414045]">
                        <span className="text-[#2f2f2fb9] text-sm dark:text-[#ACABAE] ">,</span>
                    </div>
                </div>
            </div>
        )
    else if(type==="discord" || type==="github")
    return (
        <div onClick={() => action(type)} className="hover:bg-[#c5ccdb9a] flex items-center justify-between mt-1 py-[8px] px-2 rounded-md transition-all duration-200 hover:cursor-default dark:hover:bg-[#2C2B2F]">
            <div className=" flex items-center justify-center gap-1">
                <div className="">
                    {
                        type==="github" ?
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ? "#2f2f2fa3": "#A7A6A8"} viewBox="0 0 256 256" className="w-[20px] h-[20px]">
                            <path d="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z"></path>
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ? "#2f2f2fa3": "#A7A6A8"} viewBox="0 0 256 256" className="w-[20px] h-[20px]">
                            <path d="M247.51,174.39,218,58a16.08,16.08,0,0,0-13-11.88l-36.06-5.92a16.22,16.22,0,0,0-18.26,11.88l-.21.85a4,4,0,0,0,3.27,4.93,155.62,155.62,0,0,1,24.41,5.62,8.2,8.2,0,0,1,5.62,9.7,8,8,0,0,1-10.19,5.64,155.4,155.4,0,0,0-90.8-.1,8.22,8.22,0,0,1-10.28-4.81,8,8,0,0,1,5.08-10.33,156.85,156.85,0,0,1,24.72-5.72,4,4,0,0,0,3.27-4.93l-.21-.85A16.21,16.21,0,0,0,87.08,40.21L51,46.13A16.08,16.08,0,0,0,38,58L8.49,174.39a15.94,15.94,0,0,0,9.06,18.51l67,29.71a16.17,16.17,0,0,0,21.71-9.1l3.49-9.45a4,4,0,0,0-3.27-5.35,158.13,158.13,0,0,1-28.63-6.2,8.2,8.2,0,0,1-5.61-9.67,8,8,0,0,1,10.2-5.66,155.59,155.59,0,0,0,91.12,0,8,8,0,0,1,10.19,5.65,8.19,8.19,0,0,1-5.61,9.68,157.84,157.84,0,0,1-28.62,6.2,4,4,0,0,0-3.27,5.35l3.49,9.45a16.18,16.18,0,0,0,21.71,9.1l67-29.71A15.94,15.94,0,0,0,247.51,174.39ZM92,152a12,12,0,1,1,12-12A12,12,0,0,1,92,152Zm72,0a12,12,0,1,1,12-12A12,12,0,0,1,164,152Z"></path>
                        </svg>
                    }
                </div>
                <div className="text-sm text-[#2f2f2f] dark:text-[#A7A6A8]">{text}</div>
            </div>
            <div className=" "> </div>
        </div>
    )
    else if(type==="exit") 
    return (
        <div onClick={action} className="hover:bg-[#c5ccdbca] flex items-center justify-between mt-1 py-[8px] px-2 rounded-md transition-all duration-200 hover:cursor-default dark:hover:bg-[#2C2B2F]">
            <div className=" flex items-center justify-center gap-1">
                <div className="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ff0000" viewBox="0 0 256 256" className="w-[20px] h-[20px]">
                        <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
                    </svg>
                </div>
                <div className="text-sm text-[#ff0000]">{text}</div>
            </div>
            <div className=" "> </div>
        </div>)
}