import { useState, useRef, useEffect  } from "react";
import Answer from "./answer";
import Btn from "./buttons/btn";
import Model from "./buttons/model";
import { discordUrl, pplxModelList, groqModelList, colors } from "../pages/api/constant";
import Pvd from "./buttons/pvd";

let ipcRenderer;
if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default function Search() {
    const [theme, setTheme] = useState("light"); // ["light", "dark"]
    const themes = ["light"]
    let clr = colors[theme];
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [tps, setTps] = useState(0);
    const [time, setTime] = useState(0);

    const [token, setToken] = useState("");
    const [model, setModel] = useState("pplx-7b-online");
    const [systemPrompt, setSystemPrompt] = useState("Be precise and concise.");
    const [temperature, setTemperature] = useState("0.75");
    const [maxTokens, setMaxTokens] = useState("500");

    const [settingsExpanded, setSettingsExpanded] = useState(false);
    const [modelExpanded, setModelExpanded] = useState(false);
    const [modelSelectionExpanded, setModelSelectionExpanded] = useState(false);
    const [provider, setProvider] = useState("perplexity");
    const [modelList, setModelList] = useState(pplxModelList);
    const [pplxId, setPplxId] = useState(0);
    const [groqId, setGroqId] = useState(0);


    let inputRef = useRef(null);
    const scrollerRef = useRef(null);
    const settingsRef = useRef(null);
    const modelListRef = useRef(null);
    const modelRef = useRef(null);

    // Event listener functions
    const handleSearchResult = (event, result) => {
        setAnswer(result);
        if (scrollerRef.current) {
            scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
        }
    };
    const handleSearchEnd = () => {
        setSearching(false);
    };
    const handleSearchError = (event, error) => {
        console.error(error);
        setSearching(false);
    };
    const openUrl = async () => { 
        ipcRenderer.send("open-url", discordUrl.toString()); 
        setSettingsExpanded(false);
    }
    const quitApp = () => { ipcRenderer.send("quit-app") }
    const openSettings = () => { 
        ipcRenderer.send("open-settings");
        setSettingsExpanded(false);
    }
    const handleSearchTime = (event, _tps, _time) => {
        setTime(_time);
        setTps(_tps);
    }
    const handleKeyboard = (e) => {
        if (e.key === "m" && e.metaKey) {
            setModelExpanded(!modelExpanded);
        }
    }

    // handle click outside of settings
    const handleClickOutside = (event) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target)) {
            setSettingsExpanded(false);
        }
    }

    const handleProvider = (provider) => {
        setProvider(provider);
        localStorage.setItem("provider", provider);
        setModelSelectionExpanded(true);
        if (provider === "perplexity") {
            setModelList(pplxModelList);
        } else {
            setModelList(groqModelList);
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
        if(window !== undefined) {
            const _provider = localStorage.getItem("provider");
            if (_provider && _provider !== "") {
                setProvider(_provider);
                if (_provider === "perplexity") {
                    setModelList(pplxModelList);
                    setModel(pplxModelList[pplxId]);
                    const _token = localStorage.getItem("pplx-token");
                    const _model = localStorage.getItem("pplx-model");
                    const _systemPrompt = localStorage.getItem("pplx-system-prompt") || "Be precise and concise.";
                    const _temperature = localStorage.getItem("pplx-temperature") || "0.75";
                    const _maxTokens = localStorage.getItem("pplx-max-tokens") || "500";
                    if (_token && _model && _token && _model && _systemPrompt && _temperature && _maxTokens) {
                        setToken(_token);
                        setModel(_model);
                        setSystemPrompt(_systemPrompt);
                        setTemperature(_temperature);
                        setMaxTokens(_maxTokens);
                    }
                } else if (_provider === "groq") {
                    setModelList(groqModelList);
                    setModel(groqModelList[groqId]);
                    const _token = localStorage.getItem("groq-token");
                    const _model = localStorage.getItem("groq-model");
                    const _systemPrompt = localStorage.getItem("groq-system-prompt") || "you are a helpful assistant";
                    const _temperature = localStorage.getItem("groq-temperature") || "0.75";
                    const _maxTokens = localStorage.getItem("groq-max-tokens") || "500";
                    if (_token && _model && _token && _model && _systemPrompt && _temperature && _maxTokens) {
                        setToken(_token);
                        setModel(_model);
                        setSystemPrompt(_systemPrompt);
                        setTemperature(_temperature);
                        setMaxTokens(_maxTokens);
                    }
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyboard);

        // set up IPC event listeners
        ipcRenderer.on('search-result', handleSearchResult);
        ipcRenderer.on('search-end', handleSearchEnd);
        ipcRenderer.on('search-error', handleSearchError);
        ipcRenderer.on('search-time', handleSearchTime)

        return () => { 
            ipcRenderer.removeAllListeners('search-result')
            ipcRenderer.removeAllListeners('search-end')
            ipcRenderer.removeAllListeners('search-error')
            ipcRenderer.removeAllListeners('search-time')
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyboard);
        }
    }, []);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        if (e.target.value.length !== 0) {
            setExpanded(true);
        } else {
            setAnswer("");
        }
    }
    const handleSearch = async (e) => {
        e.preventDefault()
        setSearching(true);
        if (provider === "perplexity") {
        ipcRenderer.send(
            "search-pplx", 
            query, 
            model, 
            token, 
            systemPrompt,
            parseFloat(temperature),
            parseInt(maxTokens)
            );
        } else if (provider === "groq") {
            ipcRenderer.send(
                "search-groq", 
                query, 
                model, 
                token, 
                systemPrompt,
                parseFloat(temperature),
                parseInt(maxTokens)
                );
        }
    }
    const handleSettings = () => {
        setSettingsExpanded(true);
    }
    const handleModelSelection = () => {
        setModelExpanded(!modelExpanded);
        if (modelExpanded) {
            setModelSelectionExpanded(false);
        }
    }
    const handleModel = (_model) => {
        setModel(_model);
        setModelExpanded(false);
        setModelSelectionExpanded(false);
        setModel(_model);
        console.log(model);
        if (provider === "perplexity") {
            setPplxId(pplxModelList.indexOf(_model));
            localStorage.setItem("pplx-model", _model);
            setToken(localStorage.getItem("pplx-token"));
            setSystemPrompt(localStorage.getItem("pplx-system-prompt"));
            setTemperature(localStorage.getItem("pplx-temperature"));
            setMaxTokens(localStorage.getItem("pplx-max-tokens"));
        } else if (provider === "groq") {
            setGroqId(groqModelList.indexOf(_model));
            localStorage.setItem("groq-model", _model);
            setToken(localStorage.getItem("groq-token"));
            setSystemPrompt(localStorage.getItem("groq-system-prompt"));
            setTemperature(localStorage.getItem("groq-temperature"));
            setMaxTokens(localStorage.getItem("groq-max-tokens"));
        }
    }

    // blur function, when the user clicks outside the search bar, hide the window by calling the .hide function in main/background.js
    const blur = () => {
        ipcRenderer.send('window-blur');
    }

    return (
        <div className=" h-[100vh] w-full flex flex-col relative">
            <div className={`w-full h-[60px] flex items-center rounded-lg relative draggable z-10 bg-[${clr.primary}]`}>
                <div className="w-11 h-11 mx-[5px] rounded-full flex items-center justify-center">
                    <div className={`w-7 h-7 bg-[${clr.accent}] rounded flex items-center justify-center`}>
                        <div className={`h-[60%] w-[3px] bg-[${clr.red}]`}></div>
                    </div>
                </div>
                <form className="w-full h-[90%] flex" onSubmit={handleSearch}>
                        <input
                            ref={inputRef}
                            onChange={handleQueryChange}
                            value={query}
                            placeholder="Hask AI anything..."
                            className={`w-full h-full text-[${clr.red}] outline-none text-xl font-medium bg-transparent border-r-1 custom-input`}
                        />
                </form>
            </div>
            {
                (expanded && query !== "") ?
                <main ref={scrollerRef} className={`w-full flex flex-col flex-1 -mt-3 transition-all duration-700 bg-[${clr.primary}] overflow-y-auto no-scrollbar relative`} >
                    <div className="mt-3 w-full mb-1 border-b border-b-1 border-gray-400 fixed "></div>
                    { answer !== "" ?
                        <>
                            <div className="w-full mt-5 flex items-center">
                                {
                                    searching ?
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={`${clr.black}`} viewBox="0 0 256 256" className="w-5 h-5 ml-3 animate-spin">
                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z">
                                            </path>
                                        </svg>
                                        :
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-3 ">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                                        </svg>
                                }
                                <p className="ml-2 font-medium text-md text-gray-600">Answer</p>
                            </div>
                            {
                                ( searching && answer === "") ? 
                                <div className={`mx-4 mt-2 bg-[${clr.secondaryTransparent}] rounded p-0 animate-pulse`}></div>
                                :
                                <div className={`mx-4 mt-2 bg-[${clr.secondaryTransparent}] text-lg rounded text-gray-600 px-4 pt-4 pb-6 mb-4`} >
                                        <Answer key={"0"} answer={answer} />
                                </div>
                            }
                        </>
                        :
                        <>
                            <div className="w-full h-full mt-5 flex items-center justify-center relative">
                                <div className={`flex items-center mb-5 border border-gray-600/20 rounded px-3 py-2 shadow shadow-[${clr.black}03] z-10`}>
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center animate-wiggle">
                                        <div className="w-7 h-7 rounded flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`${clr.stroke}`} className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-md text-gray-600/60 mr-[13px]">The knowledge at your hands</span>
                                </div>
                            </div>
                            
                        </>
                    }
                    <div className=" mb-9"></div>
                    <div className="bg-[z] z-10 border-t-[1px] border-gray-500/25 h-10 w-full fixed bottom-0">
                        <div className="w-full h-full flex items-center justify-between px-1">
                            <div onClick={handleSettings} className={` h-8 w-8 rounded flex items-center justify-center hover:bg-[${clr.secondaryTransparent}]`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`${clr.textRoot}a3`} className="w-[24px] h-[24px]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className={`text-sm text-[${clr.text}] italic`}>Inference: {time}ms</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`${clr.text}`} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                </svg>
                                <span className={`text-sm text-[${clr.text}] italic`}>Tokens/s: {provider === "perplexity" ? "--" : tps}</span>
                            </div>
                            <div onClick={handleModelSelection} className={`hover:bg-[${clr.secondaryTransparent}] rounded-md flex items-center justify-center h-[80%] gap-1 pl-2 pr-1 mr-1 hover:cursor-default`}>
                                <div className={`text-[${clr.text}] text-sm font-normal`}>{model}</div>
                                <div className={`h-[40%] w-[2px] rounded-full bg-[${clr.textRoot}47]`}></div>
                                <div className=" flex items-center justify-center gap-1 ">
                                    <div className={`bg-[${clr.textRoot}1d] h-[20px] w-[20px] flex items-center justify-center rounded`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={`${clr.text}`} viewBox="0 0 256 256" className="w-4 h-4">
                                            <path d="M180,144H160V112h20a36,36,0,1,0-36-36V96H112V76a36,36,0,1,0-36,36H96v32H76a36,36,0,1,0,36,36V160h32v20a36,36,0,1,0,36-36ZM160,76a20,20,0,1,1,20,20H160ZM56,76a20,20,0,0,1,40,0V96H76A20,20,0,0,1,56,76ZM96,180a20,20,0,1,1-20-20H96Zm16-68h32v32H112Zm68,88a20,20,0,0,1-20-20V160h20a20,20,0,0,1,0,40Z"></path>
                                        </svg>
                                    </div>
                                    <div className={`bg-[${clr.textRoot}1d] flex items-center justify-center rounded h-[20px] w-[20px]`}>
                                        <span className={`text-[${clr.text}] text-sm `}>M</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </main>
                :
                null
            }
            {
                ( query === "") &&
                <main className={"w-full flex flex-col flex-1 -mt-3 no-scrollbar"} onClick={blur} >
                    <div className="mt-3 w-0 mb-1 border-gray-0 fixed"></div>
                </main>
            }
            {
                settingsExpanded &&
                <div ref={settingsRef} className={`px-2 ml-3 border border-gray-600/30 rounded-md fixed bottom-12 z-10 w-[350px] max-h-[300px] overflow-auto shadow-xl bg-[${clr.footer}] shadow-[${clr.black}2e]`}>
                    <div className={`text-xs text-[${clr.textgray}9a] font-bold mt-3`}>Hask v0.1.5</div>
                    <Btn text="Settings" type={"settings"} action={openSettings} />
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px]"></div>
                    <div className={`text-xs text-[${clr.textgray}9a] font-bold mt-3`}>Community</div>
                    <Btn text="Join our community" type={"discord"} action={openUrl}/>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                    <Btn text="Quit Hask" type={"exit"} action={quitApp}/>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                </div>
            }
            {
                modelExpanded && query!=="" &&
                <div ref={modelRef} className={`px-2 border border-gray-600/30 rounded-md fixed bottom-12 right-3 z-10 w-[350px] min-h-[250px] max-h-[300px] overflow-auto shadow-xl bg-[${clr.footer}] shadow-[${clr.black}2e]`}>
                    <div className={`text-xs text-[${clr.textgray}9a] font-bold mt-3`}>Models</div>
                    <Pvd text="Perplexity" defaultModel={pplxModelList[pplxId]} selected={provider === "perplexity"} action={handleProvider} />
                    <Pvd text="Groq" defaultModel={groqModelList[groqId]} selected={provider === "groq"} action={handleProvider} />
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                </div>
            }
            {
                modelSelectionExpanded && query!=="" &&
                <div ref={modelListRef} className={`px-2 ml-3 border border-gray-600/30 rounded-md fixed bottom-16 right-4 z-10 w-[300px] h-[300px] max-h-[400px] shadow-xl bg-[${clr.footer}] shadow-[${clr.black}2e] flex flex-col`}>
                    <div className={`text-xs text-[${clr.textgray}9a] font-bold mt-3 flex items-center gap-2 hover:cursor-default`}>
                        <div onClick={() => setModelSelectionExpanded(false)} className={`bg-[${clr.textgray}16] hover:bg-[${clr.textgray}3f] transition duration-100 rounded p-1`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="">Back</span>
                    </div>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px]"></div>
                    <div className="flex-1 overflow-auto ">
                        <div className={`text-xs text-[${clr.textgray}9a] font-bold mt-3`}>Perplexity models</div>
                        {
                            modelList.map((mod, index) => (
                                <Model key={index} text={mod} selected={mod === model} action={handleModel}/>
                            ))
                        }
                        <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                    </div>
                </div>
            }
        </div>
    );
}
