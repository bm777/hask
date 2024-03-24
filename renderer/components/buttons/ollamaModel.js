export default function OllamaModel({ name, description, active, action}) {

    const handleClick = () => { 
        action(name)
    }
    return (
        <div onClick={handleClick} className="w-full h-12 flex items-center justify-center my-1 hover:cursor-default ">
            <div className={"w-[98%] h-full flex flex-col px-2 pt-1 rounded-md  border border-gray-600/30 hover:border-gray-400/30 dark:hover:border-gray-400/30 relative " + (active ? "dark:bg-blackish/20" : "dark:bg-grayish/5")}>
                <span className="text-[#2f2f2fa3] dark:text-[#A7A6A8]">{name}</span>
                <span className="text-xs text-[#2f2f2f69] dark:text-[#a7a6a8a2] truncate">{description}</span>
            </div>
            
        </div>
    )
}