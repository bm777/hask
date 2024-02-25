import { useState } from 'react';

export default function Provider({ provider, active, handleTabChange }) {
    const [hover, setHover] = useState(false);

    const handleHover = () => {
        if (!active) { setHover(true); }
    }
    const exit = () => { setHover(false); }
    
    if (active) { return (
                <div className="px-2 flex flex-col justify-end">
                    <div className="text-gray-900 hover:bg-[#c5ccdb9a] hover:cursor-pointer mb-[3px] px-2 py-1 rounded">
                        { provider }
                    </div>
                    <div className="border-b-[3px] border-gray-600 -mb-[2px]"></div>
                </div>
    )} else {
        return (
                <div onClick={() => handleTabChange(provider.toLowerCase())} className="px-2 flex flex-col justify-end relative ">
                    {
                        ( hover && provider !== "Groq" && provider !== "Perplexity") &&
                        <div id='soon' className=" flex justify-end absolute top-0 duration-300 transform">
                            <span className="border border-[#f68193] bg-[#f6819331] rounded-full px-2 text-xs ml-5 -mb-2">soon</span>
                        </div>
                    }
                    <div className="text-gray-600 hover:bg-[#c5ccdb9a] hover:cursor-pointer mb-[3px] px-2 py-1 rounded duration-300 transform" onMouseEnter={handleHover} onMouseOut={exit}>
                        { provider }
                    </div>
                    <div className="border-b-[3px] border-[#0000] -mb-[2px]"></div>
                </div>
        )
    }
    
}