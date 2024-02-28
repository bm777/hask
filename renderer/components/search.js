// import { optionsConstructor, parseLink } from "../pages/api/methods";
import { useState, useRef, useEffect } from "react";
import Answer from "./answer";

let ipcRenderer;
if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default function Search() {
    // State and refs setup
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [token, setToken] = useState("");
    const [model, setModel] = useState("pplx-7b-online");

    let inputRef = useRef(null);
    const scrollerRef = useRef(null);

    // Event listener functions
    const handleSearchResult = (event, result) => {
        setAnswer(result);
        if (scrollerRef.current) {
            scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
        }
    };

    const handleSearchEnd = () => {
        console.log("Search ended");
        setSearching(false);
    };

    const handleSearchError = (event, error) => {
        console.error(error);
        setSearching(false);
    };

    // Effect for setting up listeners and retrieving token
    useEffect(() => {
        // Set focus on the input field
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
        
        // Retrieve the token from localStorage
        const savedToken = localStorage.getItem("pplx-token");
        if (savedToken) {
            setToken(savedToken);
        }

        // Set up IPC event listeners
        ipcRenderer.on("search-result", handleSearchResult);
        ipcRenderer.on("search-end", handleSearchEnd);
        ipcRenderer.on("search-error", handleSearchError);
    
        // Remove listeners for search-related events on cleanup
        return () => {
            ipcRenderer.removeListener("search-result", handleSearchResult);
            ipcRenderer.removeListener("search-end", handleSearchEnd);
            ipcRenderer.removeListener("search-error", handleSearchError);
        };
    }, []); // The useEffect dependency array is empty

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        setExpanded(e.target.value.length !== 0);
        if (e.target.value.length === 0) {
            setAnswer("");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);

        // Retrieve the settings from localStorage
        const _systemPrompt = localStorage.getItem("pplx-system-prompt") || "Be precise and concise.";
        const _temperature = localStorage.getItem("pplx-temperature") || "0.75";
        const _maxTokens = localStorage.getItem("pplx-max-tokens") || "500";

        // Send the search query and settings to the main process
        ipcRenderer.send(
            "search",
            query,
            model,
            token, // Use the token state which was set from localStorage
            _systemPrompt,
            parseFloat(_temperature),
            parseInt(_maxTokens, 10)
        );
    };

    // Function to handle when the user clicks outside the search bar
    const blur = () => {
        ipcRenderer.send('window-blur');
    };

    return (
        <div className="bg-[#00000000] h-[100vh] w-full flex flex-col">
            <div className="w-full h-[60px] flex items-center bg-[#e0e5f6] rounded-lg relative draggable">
                <div className="w-11 h-11 mx-[5px] rounded-full flex items-center justify-center">
                    <div className="w-7 h-7 bg-[#FFB2BE] rounded flex items-center justify-center">
                        <div className="h-[60%] w-[3px] bg-[#561D2A]"></div>
                    </div>
                </div>
                <form className="w-full h-[90%] flex" onSubmit={handleSearch}>
                        <input
                            ref={inputRef}
                            onChange={handleQueryChange}
                            value={query}
                            placeholder="Hask AI anything..."
                            className="w-full h-full text-[#561D2A] outline-none text-3xl font-medium bg-transparent border-r-1 custom-input"
                        />
                </form>
            </div>
            
            {
                (expanded && query !== "") ?
                <main ref={scrollerRef} className={"w-full flex flex-col flex-1 -mt-3 transition-all duration-700 bg-[#e0e5f6] overflow-y-auto no-scrollbar "} >
                    <div className="mt-3 w-full mb-1 border-b border-b-1 bg-[#e0e5f6] border-gray-400 fixed z-10"></div>
                    <div className="w-full mt-5 flex items-center">
                        {
                            searching ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256" className="w-6 h-6 ml-3 animate-spin">
                                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z">
                                    </path>
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 ml-3 ">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                                </svg>
                        }
                        <p className="ml-2 font-medium text-xl text-gray-600">Answer</p>
                    </div>
                    {
                       ( searching && answer === "") ? 
                       <div className="mx-4 mt-2 bg-[#c5ccdb9a] rounded p-4 animate-pulse"> </div>
                       :
                       <div className="mx-4 mt-2 bg-[#c5ccdb9a] text-lg rounded text-gray-600 p-4 mb-4" >
                            <Answer key={"0"} answer={answer} />
                       </div>
                    }
                    
                </main>
                :
                null
            }
            {
                (!expanded && query === "") &&
                <main className={"w-full flex flex-col flex-1 -mt-3 ] no-scrollbar"} onClick={blur} >
                    <div className="mt-3 w-0 mb-1 border-b border-b-bg-[#e0e5f6] bg-[#e0e5f600] border-gray-0 fixed"></div>
                </main>
            }

            
        </div>
    );
}
