import { useState, useRef, useEffect  } from "react";
import Answer from "./answer";
import Btn from "./buttons/btn";
import Model from "./buttons/model";
import { discordUrl, githubUrl, pplxModelList, groqModelList } from "../pages/api/constant";
import Pvd from "./buttons/pvd";
import { useTheme } from "next-themes";
import { capitalize,  generateOllama,  getOllamaTags} from "../pages/api/methods";

// let ipcRenderer;
// if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
//     ipcRenderer = window.require("electron").ipcRenderer;
// }

export default function Search() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [tps, setTps] = useState(0);
    const [time, setTime] = useState(0);
    const {theme, setTheme} = useTheme();

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
    const [ollamaId, setOllamaId] = useState(0);

    const [ollamaModelList, setOllamaModelList] = useState([]);

    let inputRef = useRef(null);
    const scrollerRef = useRef(null);
    const settingsRef = useRef(null);
    const modelListRef = useRef(null);
    const modelRef = useRef(null);

    // Event listener functions
    const handleSearchResult = (result) => {
        setAnswer(result);
        if (scrollerRef.current) {
            scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
        }
    };
    const handleSearchEnd = () => { setSearching(false); };
    const handleSearchError = (error) => { console.error(error); setSearching(false); };
    const openUrl = async (socialType) => { 
        window.ipc.send("open-url", socialType==="discord" ? discordUrl.toString() : githubUrl.toString()); 
        setSettingsExpanded(false);
    }
    const quitApp = () => { window.ipc.send("quit-app") }
    const openSettings = () => { 
        window.ipc.send("open-settings");
        setSettingsExpanded(false);
    }
    const handleSearchTime = (_tps, _time) => {
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
    const handleProvider = async (provider) => {
        setProvider(provider);
        localStorage.setItem("provider", provider);
        setModelSelectionExpanded(true);
        if (provider === "perplexity") {
            setModelList(pplxModelList);
        } else if (provider === "groq") {
            setModelList(groqModelList);
        } else if (provider === "ollama") {
            setModelList(await getOllamaTags());
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
        if(window !== undefined) {
            const _provider = localStorage.getItem("provider") || "perplexity";
            setProvider(_provider);
            if (_provider === "perplexity") {
                configurePerplexity();
            } else if (_provider === "groq") {
                configureGroq();
            } else if (_provider === "ollama") {
                configureOllama();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyboard);

        // set up IPC event listeners
        window.ipc.on('search-result', handleSearchResult);
        window.ipc.on('search-end', handleSearchEnd);
        window.ipc.on('search-error', handleSearchError);
        window.ipc.on('search-time', handleSearchTime)

        return () => { 
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyboard);
        }
    }, []);

    const configurePerplexity = (skip_model=false) => {
        setModelList(pplxModelList);
        if (!skip_model) {
            setModel(localStorage.getItem("pplx-model") || pplxModelList[pplxId]);
        }
        setToken(localStorage.getItem("pplx-token"));
        setSystemPrompt(localStorage.getItem("pplx-system-prompt") || "Be precise and concise.");
        setTemperature(localStorage.getItem("pplx-temperature") || "0.7");
        setMaxTokens(localStorage.getItem("pplx-max-tokens") || "512");
    }
    const configureGroq = (skip_model=false) => {
        setModelList(groqModelList);
        if (!skip_model) {
            setModel(localStorage.getItem("groq-model") || groqModelList[groqId]);
        }
        setToken(localStorage.getItem("groq-token"));
        setSystemPrompt(localStorage.getItem("groq-system-prompt") || "You are a helpful assistant");
        setTemperature(localStorage.getItem("groq-temperature") || "0.7");
        setMaxTokens(localStorage.getItem("groq-max-tokens") || "500");
    }
    const configureOllama = async (skip_model=false) => {
        if (!skip_model) {
            const interval = setInterval(async () => {
                const tags = await getOllamaTags();
                if(tags.length === 0) {
                    setModelList([]);
                    setModel("");
                } else {
                    if (tags[0] !== "loading...") {
                        setOllamaModelList(tags);
                        setModelList(tags);
                        setModel(localStorage.getItem("ollama-model") || tags[ollamaId || 0]);
                        clearInterval(interval);
                    } else {
                        setOllamaModelList(["loading..."]);
                        setModel("loading...");
                    }
                }
            }, 1000);
        }
        // setToken(localStorage.getItem("ollama-token"));
        setSystemPrompt(localStorage.getItem("ollama-system-prompt") || "You are a helpful assistant");
        setTemperature(localStorage.getItem("ollama-temperature") || "0.7");
        setMaxTokens(localStorage.getItem("ollama-max-tokens") || "500");
    }

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
        window.ipc.send(
            "search-pplx", 
            {
                query, 
                model, 
                token, 
                systemPrompt,
                temperature: parseFloat(temperature),
                maxTokens: parseInt(maxTokens)
            });
        } else if (provider === "groq") {
            window.ipc.send(
                "search-groq", 
                { 
                    query, 
                    model, 
                    token, 
                    systemPrompt,
                    temperature: parseFloat(temperature),
                    maxTokens: parseInt(maxTokens)
                });
        } else if (provider === "ollama") {
            window.ipc.send("logger", "generating-token...");
            try {
                setSearching(true);
                setAnswer(" ");
                const stream = await generateOllama({
                    model: model,
                    prompt: query,
                    stream: true,
                    options: {
                        num_predict: parseInt(maxTokens),
                        temperature: parseFloat(temperature),
                        // penalize_newline: true,
                        top_p: 0.9,
                        // presence_penalty: 0.6,
                        stop: [ "User:", "Assistant:", "User:"] //["\n"]
                    }
                }) 
                setAnswer("");
                for await (const out of stream) {
                    if(!out.done) {
                        window.ipc.send("logger", ["---->", out.response]);
                        // append to the previous answer
                        setAnswer(prevAnswer => prevAnswer + out.response);
                        // temp += out.response;
                        // setAnswer(temp);
                    }
                }
                setSearching(false)
            } catch (error) {
                window.ipc.send("logger", ["search-ollama-error", error]);
                setSearching(false);
            }
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
    const handleModel = async (_model) => {
        setModel(_model);
        setModelExpanded(false);
        setModelSelectionExpanded(false);
        if (provider === "perplexity") {
            configurePerplexity(true);
            localStorage.setItem("pplx-model", _model);
            setPplxId(pplxModelList.indexOf(_model) || 0);

        } else if (provider === "groq") {
            configureGroq(true);
            localStorage.setItem("groq-model", _model);
            setGroqId(groqModelList.indexOf(_model) || 0);

        } else if (provider === "ollama") {
            configureOllama(true);
            localStorage.setItem("ollama-model", _model);
            setOllamaId(ollamaModelList.indexOf(_model) || 0);

        }
    }

    // blur function, when the user clicks outside the search bar, hide the window by calling the .hide function in main/background.js
    const blur = () => {
        window.ipc.send('window-blur');
    }

    return (
        <div className=" h-[100vh] w-full flex flex-col relative">
            <div className={`w-full h-[60px] flex items-center rounded-lg relative duration-700 draggable z-10 bg-[#e0e5f6] dark:bg-[#19171B]`}>
                <div className="w-11 h-11 mx-[5px] rounded-full flex items-center justify-center">
                    <div className={`w-7 h-7 bg-[#FFB2BE] rounded flex items-center justify-center`}>
                        <div className={`h-[60%] w-[3px] bg-[#561D2A]`}></div>
                    </div>
                </div>
                <form className="w-full h-[90%] flex" onSubmit={handleSearch}>
                        <input
                            ref={inputRef}
                            onChange={handleQueryChange}
                            value={query}
                            placeholder="Hask anything..."
                            className={`w-full h-full text-[#561D2A] outline-none text-xl font-medium bg-transparent custom-input dark:text-[#afafafc8] dark:placeholder:text-[#4c4c4d]`}
                        />
                </form>
            </div>
            {
                (expanded && query !== "") ?
                <main ref={scrollerRef} className={`w-full flex flex-col flex-1 -mt-3 transition-all duration-700 bg-[#e0e5f6] overflow-y-auto no-scrollbar relative dark:bg-[#19171B]`} >
                    <div className="mt-3 w-full mb-1 border-b border-b-1 border-gray-400 fixed duration-700 dark:border-[#2E2E2E]"></div>
                    { answer !== "" ?
                        <>
                            <div className="w-full mt-5 flex items-center">
                                {
                                    searching ?
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={`#757575`} viewBox="0 0 256 256" className="w-5 h-5 ml-3 animate-spin">
                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z">
                                            </path>
                                        </svg>
                                        :
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme === "light" ? "#4b5563" : "#9E9D9F"} className="w-5 h-5 ml-3 ">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                                        </svg>
                                }
                                <p className="ml-2 font-medium text-md text-gray-600 dark:text-[#9E9D9F]">Answer</p>
                            </div>
                            {
                                ( searching && answer === "") ? 
                                <div className={`mx-4 mt-2 bg-[#c5ccdb9a] rounded p-0 animate-pulse`}></div>
                                :
                                <div className={`mx-4 mt-2 bg-[#c5ccdb9a] text-lg rounded text-gray-600 duration-700 px-4 pt-4 pb-8 mb-4 dark:bg-[#312F32] dark:text-[#A7A6A8]`} >
                                        <Answer key={"0"} answer={answer} searching={searching} />
                                </div>
                            }
                        </>
                        :
                        <>
                            <div className="w-full h-full mt-5 flex items-center justify-center relative">
                                <div className={`flex items-center mb-5 border border-gray-600/20 rounded px-3 py-2 shadow shadow-[#00000003] z-10`}>
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center animate-wiggle">
                                        <div className="w-7 h-7 rounded flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`#561D2A`} className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-md text-gray-600/60 mr-[13px]">Knowledge at your fingertips</span>
                                </div>
                            </div>
                            
                        </>
                    }
                    <div className=" mb-9"></div>
                    {/* 19171C */}
                    <div className={`bg-[#d8dceab0] z-10 border-t-[1px] border-gray-500/25 h-10 w-full duration-700 fixed bottom-0 backdrop-blur-sm dark:bg-[#19171cc3] dark:border-[#2E2E2E]`}>
                        <div className="w-full h-full flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div onClick={handleSettings} className={` h-8 w-8 rounded flex items-center justify-center hover:bg-[#c5ccdb9a] dark:hover:bg-[#2C2B2F]`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme === "light" ? "#2f2f2fa3" : "#ACABAE"} className="w-[24px] h-[24px]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                                    </svg>
                                </div>
                                <div onClick={() => setTheme(theme ===  "light" ? "dark" : 'light')} className={` h-8 w-8 rounded flex items-center justify-center duration-300 hover:bg-[#c5ccdb9a] dark:hover:bg-[#2C2B2F]`}>
                                    {
                                        theme === "dark" ?
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={theme === "light" ? "#2f2f2fa3" : "#ACABAE"} className="w-4 h-4">
                                            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                                        </svg>
                                        :
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={theme === "light" ? "#2f2f2fa3" : "#ACABAE"} className=" w-5 h-5">
                                            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                                        </svg>
                                      
                                    }
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className={`text-sm text-[#2f2f2fb9] italic dark:text-[#a7a6a8ad]`}>Inference: {time}ms</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ? "#2f2f2fb9" : `#a7a6a8ad`} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                </svg>
                                <span className={`text-sm text-[#2f2f2fb9] italic dark:text-[#a7a6a8ad]`}>Tokens/s: {provider === "perplexity" ? "--" : tps}</span>
                            </div>
                            <div onClick={handleModelSelection} className={`hover:bg-[#c5ccdb9a] rounded-md flex items-center justify-center h-[80%] gap-2 pl-2 pr-1 mr-1 hover:cursor-default dark:hover:bg-[#2C2B2F]`}>
                                <div className={`text-[#2f2f2fb9] text-sm font-normal dark:text-[#a7a6a8ad]`}>{model}</div>
                                <div className={`h-[40%] w-[2px] rounded-full bg-[#2f2f2f47] dark:bg-[#414045]`}></div>
                                <div className=" flex items-center justify-center gap-1 ">
                                    <div className={`bg-[#2f2f2f1d] h-[24px] w-[24px] flex items-center justify-center rounded-md border border-[#8181814b] dark:bg-[#414045]`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={theme==="light" ?"#2f2f2fb9":"#ACABAE"} viewBox="0 0 256 256" className="w-4 h-4">
                                            <path d="M180,144H160V112h20a36,36,0,1,0-36-36V96H112V76a36,36,0,1,0-36,36H96v32H76a36,36,0,1,0,36,36V160h32v20a36,36,0,1,0,36-36ZM160,76a20,20,0,1,1,20,20H160ZM56,76a20,20,0,0,1,40,0V96H76A20,20,0,0,1,56,76ZM96,180a20,20,0,1,1-20-20H96Zm16-68h32v32H112Zm68,88a20,20,0,0,1-20-20V160h20a20,20,0,0,1,0,40Z"></path>
                                        </svg>
                                    </div>
                                    <div className={`bg-[#2f2f2f1d] flex items-center justify-center rounded-md border border-[#8181814b] h-[24px] w-[24px] dark:bg-[#414045]`}>
                                        <span className={`text-[#2f2f2fb9] text-sm dark:text-[#ACABAE] `}>M</span>
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
                <div ref={settingsRef} className={`px-2 ml-3 border border-gray-600/30 rounded-md fixed bottom-12 z-10 w-[350px] max-h-[300px] overflow-auto shadow-xl bg-[#d8dcea] shadow-[#0000002e] dark:bg-[#19171C]`}>
                    <div className={`text-xs text-[#4d4e509a] font-bold mt-3 dark:text-[#93929497]`}>Hask v0.1.5</div>
                    <Btn text="Settings" type={"settings"} action={openSettings} />
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px]"></div>
                    <div className={`text-xs text-[#4d4e509a] font-bold mt-3 dark:text-[#93929497]`}>Community</div>
                    <Btn text="Join our community" type={"discord"} action={openUrl}/>
                    <Btn text="Support Us" type={"github"} action={openUrl}/>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                    <Btn text="Quit Hask" type={"exit"} action={quitApp}/>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                </div>
            }
            {
                modelExpanded && query!=="" &&
                <div ref={modelRef} className={`px-2 border border-gray-600/30 rounded-md fixed bottom-12 right-3 z-10 w-[350px] min-h-[250px] max-h-[300px] overflow-auto shadow-xl bg-[#d8dcea] shadow-[#0000002e] dark:bg-[#19171C]`}>
                    <div className={`text-xs text-[#4d4e509a] font-bold mt-3 dark:text-[#93929497]`}>Models</div>
                    <Pvd text="Perplexity" defaultModel={pplxModelList[pplxId]} selected={provider === "perplexity"} action={handleProvider} />
                    <Pvd text="Groq" defaultModel={groqModelList[groqId]} selected={provider === "groq"} action={handleProvider} />
                    <Pvd text="Ollama" defaultModel={ ollamaModelList?.length === 0 && "loading..." || ollamaModelList[ollamaId] } selected={provider === "ollama"} action={handleProvider} />
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px] mb-2"></div>
                </div>
            }
            {
                modelSelectionExpanded && query!=="" &&
                <div ref={modelListRef} className={`px-2 ml-3 border border-gray-600/30 rounded-md fixed bottom-16 right-4 z-10 w-[300px] h-[300px] max-h-[400px] shadow-xl bg-[#d8dcea] shadow-[#0000002e] flex flex-col dark:bg-[#19171C] `}>
                    <div className={`text-xs text-[#4d4e509a] font-bold mt-3 flex items-center gap-2 hover:cursor-default`}>
                        <div onClick={() => setModelSelectionExpanded(false)} className={`bg-[#4d4e5016] hover:bg-[#4d4e503f] transition duration-100 rounded p-1 border border-[#8181814b] dark:hover:bg-[#2C2B2F]`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={theme==="light" ?"#2f2f2fb9":"#8181814b"} className="w-4 h-4">
                                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="">Back</span>
                    </div>
                    <div className="w-full h-1 border-b border-gray-600/20 my-[6px]"></div>
                    <div className="flex-1 overflow-auto ">
                        <div className={`text-xs text-[#4d4e509a] font-bold mt-3 dark:text-[#93929497]`}>{capitalize(provider)} models</div>
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
