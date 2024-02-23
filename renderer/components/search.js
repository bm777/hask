import { useState, useRef, useEffect  } from "react";
// import { optionsConstructor, parseLink } from "../pages/api/methods";
import Answer from "./answer";

let ipcRenderer;
if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
    ipcRenderer = window.require("electron").ipcRenderer;
}


export default function Search() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [token, setToken] = useState("");
    const [model, setModel] = useState("pplx-7b-online");
    const [imageUrl, setImageUrl] = useState('');

    let inputRef = useRef(null);

    useEffect(() => {

        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
        if(window !== undefined) {
            const _token = localStorage.getItem("pplx-token");
            const _model = localStorage.getItem("pplx-model");
            console.log(_token);
            if (_token && _model) {
                setToken(_token);
                setModel(_model);
            }
        }
        return () => { 
            ipcRenderer.removeAllListeners('window-blur') 
            ipcRenderer.removeAllListeners('warning')
            ipcRenderer.removeAllListeners('search-result')
            ipcRenderer.removeAllListeners('search-end')
            ipcRenderer.removeAllListeners('search-error')
        }

    }, []);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        if (e.target.value.length !== 0) {
            setExpanded(true);
        } else {
            setExpanded(false);
            setAnswer("");
        }
    }
    const handleSearch = async (e) => {
        e.preventDefault()
        setSearching(true);

        // const result = await searchPPLX(query, token, model);

        ipcRenderer.send("search", query, model, token);
        ipcRenderer.on("search-result", (e, result) => {   
            setAnswer(result);
        });
        ipcRenderer.on("search-end", (e) => {
            console.log("Search ended");
            setSearching(false);
        });
        ipcRenderer.on("search-error", (e, error) => {
            
            setSearching(false);
        });


    }


    // blur function, when the user clicks outside the search bar, hide the window by calling the .hide function in main/background.js
    const blur = () => {
        ipcRenderer.send('window-blur');
    }

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
                <main className={"w-full flex flex-col flex-1 -mt-3 bg-[#e0e5f6] overflow-auto no-scrollbar"} >
                    <div className="mt-3 w-full mb-1 border-b border-b-1 bg-[#e0e5f6] border-gray-400 fixed"></div>
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
                            <Answer answer={answer} />
                       </div>
                    }
                    
                </main>
                :
                null
            }
            {
                (!expanded && query === "") &&
                <main className={"w-full flex flex-col flex-1 -mt-3 ] overflow-auto no-scrollbar"} onClick={blur} >
                    <div className="mt-3 w-0 mb-1 border-b border-b-bg-[#e0e5f6] bg-[#e0e5f600] border-gray-0 fixed"></div>

                </main>
            }

            
        </div>
    );
}
