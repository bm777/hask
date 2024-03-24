export default function OllamaModel({ name, description, active, action}) {

    const handleClick = () => { 
        action(name)
    }
    return (
        <div onClick={handleClick} className="w-full h-12 flex items-center justify-center my-1 hover:cursor-default ">
            <div className={"w-[98%] h-full flex flex-col px-2 pt-1 rounded-md border border-gray-600/10 hover:border-gray-600/15 dark:hover:border-gray-400/30 relative " + (active ? "bg-gray-600/15 dark:bg-blackish/20" : "bg-gray-300/10 dark:bg-grayish/5")}>
                <span className="text-grayish/80 dark:text-dark-text">{name}</span>
                <span className="text-xs text-grayish/60 dark:text-dark-text/70 truncate">{description}</span>
            </div>
            
        </div>
    )
}