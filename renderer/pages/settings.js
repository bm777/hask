import { useEffect, useState } from "react";
import Provider from "../components/provider";
import { pplxModelList, groqModelList, ollamaModelList } from "./api/constant";
import { useTheme } from "next-themes";
import OllamaModel from "../components/buttons/ollamaModel";
import { joinValue } from "./api/methods";
import Preview from "../components/cards/modelPreview";

export default function Settings() {
    const [log, setLog] = useState("")
    const [provider, setProvider] = useState("perplexity");
    const [token, setToken] = useState("");
    const [models, setModels] = useState(pplxModelList);
    const [model, setModel] = useState("pplx-7b-online");
    const [systemPrompt, setSystemPrompt] = useState("Be precise and concise.");
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(500);
    const [ollamaDownload, setOllamaDownload] = useState(false);
    const [ollamaSearch, setOllamaSearch] = useState("");
    const [cursorModel, setCursorModel] = useState("");
    const { theme } = useTheme();

    const [pplxStatus, setPplxStatus] = useState(false);
    const [groqStatus, setGroqStatus] = useState(false);


    useEffect(() => {
        // try to load the token and model from local storage
        const _provider = localStorage.getItem("provider");
        setProvider( _provider || "perplexity" )
        console.log("provider", _provider);

        // check if provider is defined
        if (_provider === "perplexity") {
            const _token = localStorage.getItem("pplx-token");
            const _model = localStorage.getItem("pplx-model");
            const _systemPrompt = localStorage.getItem("pplx-system-prompt");
            const _temperature = localStorage.getItem("pplx-temperature");
            const _maxTokens = localStorage.getItem("pplx-max-tokens");
            changeStatus(_provider);
            if (_token) { setToken(_token); }
            if (_model) { setModel(_model); setModels(pplxModelList);}
            if (_systemPrompt) { setSystemPrompt(_systemPrompt); }
            if (_temperature) { setTemperature(_temperature); }
            if (_maxTokens) { setMaxTokens(_maxTokens); }
        } 
        else if (_provider === "groq") {
            const _token = localStorage.getItem("groq-token");
            const _model = localStorage.getItem("groq-model");
            const _systemPrompt = localStorage.getItem("groq-system-prompt");
            const _temperature = localStorage.getItem("groq-temperature");
            const _maxTokens = localStorage.getItem("groq-max-tokens");
            changeStatus(_provider);
            if (_token) { setToken(_token); }
            if (_model) { setModel(_model); setModels(groqModelList);}
            if (_systemPrompt) { setSystemPrompt(_systemPrompt); }
            if (_temperature) { setTemperature(_temperature); }
            if (_maxTokens) { setMaxTokens(_maxTokens); }
        }
    }
    , [provider]);

    const handleTokenChange = (e) => { 
        setToken(e.target.value);
    }
    const handleModelChange = (e) => {
        setModel(e.target.value);
    }
    const handleSave = async () => {
        if (provider === "perplexity") {
            localStorage.setItem("provider", provider);
            localStorage.setItem("pplx-token", token);
            localStorage.setItem("pplx-model", model);
            localStorage.setItem("pplx-system-prompt", systemPrompt);
            localStorage.setItem("pplx-temperature", temperature);
            localStorage.setItem("pplx-max-tokens", maxTokens);
        }
        if (provider === "groq") {
            localStorage.setItem("provider", provider);
            localStorage.setItem("groq-token", token);
            localStorage.setItem("groq-model", model);
            localStorage.setItem("groq-system-prompt", systemPrompt);
            localStorage.setItem("groq-temperature", temperature);
            localStorage.setItem("groq-max-tokens", maxTokens);
        }
        setLog("Configuration Saved!");
        await new Promise(r => setTimeout(r, 3000));
        setLog("");
    }
    const changeStatus = (prov) => {
        if (prov === "perplexity") {
            setPplxStatus(true);
            setGroqStatus(false);
        }
        else if (prov === "groq") {
            setPplxStatus(false);
            setGroqStatus(true);
        }
    }
    const handleTabChange = (prov) => {
        // temporary blockage of switching providers
        // if (provider !== "perplexity" ) {
        //     return;
        // }
        setProvider(prov);
        localStorage.setItem("provider", prov);
        if (prov === "perplexity") {
            const pplxToken = localStorage.getItem("pplx-token");
            const pplxModel = localStorage.getItem("pplx-model");
            const pplxSystemPrompt = localStorage.getItem("pplx-system-prompt");
            const pplxTemperature = localStorage.getItem("pplx-temperature");
            const pplxMaxTokens = localStorage.getItem("pplx-max-tokens");
            console.log("pplxToken", pplxToken, "pplxModel", pplxModel, "pplxSystemPrompt", pplxSystemPrompt, "pplxTemperature", pplxTemperature, "pplxMaxTokens", pplxMaxTokens);
            changeStatus(prov);
            setToken(pplxToken);
            setModel(pplxModel);
            setModels(pplxModelList);
            setSystemPrompt(pplxSystemPrompt);
            setTemperature(pplxTemperature);
            setMaxTokens(pplxMaxTokens);
        } 
        else if (prov === "groq") {
            const groqToken = localStorage.getItem("groq-token");
            const groqModel = localStorage.getItem("groq-model");
            const groqSystemPrompt = localStorage.getItem("groq-system-prompt");
            const groqTemperature = localStorage.getItem("groq-temperature");
            const groqMaxTokens = localStorage.getItem("groq-max-tokens");
            changeStatus(prov);
            setToken(groqToken);
            setModel(groqModel);
            setModels(groqModelList);
            setSystemPrompt(groqSystemPrompt);
            setTemperature(groqTemperature);
            setMaxTokens(groqMaxTokens);
        } 
        else {

        }
        // console.log("provider", provider, "prov", prov);
    }
    const handleSystemPrompt = (e) => { setSystemPrompt(e.target.value); }
    const handleTemperature = (e) => { setTemperature(parseFloat(e.target.value));}
    const handleMaxTokens = (e) => {setMaxTokens(parseInt(e.target.value));}
    const handleOllamaSearch = (e) => {setOllamaSearch(e.target.value);}
    const handleCursor = (new_cursor) => {setCursorModel(new_cursor);}

    return (
        <div className="w-screen h-screen bg-[#e0e5f6] flex flex-col dark:bg-[#19171B] relative">
            <div className=" h-20 flex items-center justify-center gap-3">
                <div className="bg-[#c5ccdb9a] rounded-md px-6 py-2 flex flex-col items-center justify-center dark:bg-[#2C2B2F]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"#2f2f2fb9":"#8181814b"} className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                    </svg>

                    <span className="text-gray-600 dark:text-[#93929497]">Settings</span>
                </div>
            </div>

            <div className="border-t mt-1 border-gray-400 flex-1 flex flex-col items-center dark:border-t-[#2E2E2E]">
                <div className="w-full mt-1 gap-1 h-[50px] flex justify-center border-b border-gray-400 dark:border-b-[#2E2E2E]">
                    <Provider active={pplxStatus} _provider={"Perplexity"} handleTabChange={handleTabChange} />
                    <Provider active={groqStatus} _provider={"Groq"} handleTabChange={handleTabChange} />
                    <Provider active={false} _provider={"OpenAI"} handleTabChange={handleTabChange} />
                    <Provider active={false} _provider={"Cohere"} handleTabChange={handleTabChange} />
                </div>
                
                <div className="w-full mt-8 gap-1 flex justify-center ">
                    <div className="h-7 w-[20%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">API-Key:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <input
                                onChange={handleTokenChange}
                                value={token}
                                placeholder="Paste your API-Key here..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center  ">
                    <div className="h-7 w-[20%] flex items-center ">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">model:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <select onChange={handleModelChange} value={model} className="w-full h-full bg-transparent rounded-md text-black placeholder:text-gray-500/80 focus:outline-none dark:text-[#A7A6A8]">
                            {
                                models.map((model, index) => {
                                    return <option key={index} className=" ">{model}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center ">
                    <div className="h-7 w-[20%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">System prompt:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <input
                                onChange={handleSystemPrompt}
                                value={systemPrompt}
                                placeholder="System prompt..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                        />  
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center">
                    <div className="h-7 w-[20%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">Temperature:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <input
                                onChange={handleTemperature}
                                value={temperature}
                                type="number"
                                placeholder="Paste your API-Key here..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center">
                    <div className="h-7 w-[20%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">Max token:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <input
                                onChange={handleMaxTokens}
                                value={maxTokens}
                                type="number"
                                placeholder="900"
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-5 gap-1 flex justify-center  ">
                    <div onClick={handleSave} className=" border border-[#561d2a65] bg-[#FFB2BE] hover:bg-[#f68193] px-10 h-7 hover:cursor-pointer text-[#561D2A] rounded text-sm flex items-center justify-center duration-200 transform">save</div>
                </div>
                
                {
                    log !== "" &&
                    <div className="w-full mt-5 gap-1 flex justify-center border ">
                        <div onClick={handleSave} className=" hover:underline text-[#561D2A] rounded text-sm flex items-center justify-center duration-200 transform">{log}</div>
                    </div>
                }
                

                <div className="w-full mt-5 gap-1 flex justify-center fixed bottom-5">
                    <div className="h-7 flex flex-col justify-center">
                        {/* <p className="w-full text-gray-500 text-sm font-medium ">More models are coming.</p> */}
                        {/* <p className="w-full text-gray-500 text-center text-sm ">Waiting for the access to integrate it!</p> */}
                    </div>
                </div>
            </div>

            {
                !ollamaDownload &&
                <div className="w-full h-full absolute flex items-center justify-center">
                    <div className="border border-gray-400 w-[740px] h-[400px] bg-[#e0e5f6] shadow-2xl shadow-black rounded flex flex-col dark:bg-[#19171b] dark:border-[#2E2E2E]">
                        <div className="h-6 draggable flex items-center rounded-t bg-gradient-to-r from-[#e0e5f6] to-[#9498a2] dark:from-[#1c1820] dark:to-[#19171b]">
                            <div className={`hover:bg-[#FF5F573f] h-4 w-4 ml-[4px] transition duration-100 rounded-full flex items-center bg-[#FF5F57] justify-center border border-[#8181814b] dark:hover:bg-[#FF5F573f]`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={theme==="light" ?"black":"black"} className="w-4 h-4">
                                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gray-400 h-[1px] dark:bg-[#2e2e2e8c]"></div>
                        <div className=" h-12 flex items-center">
                            <div className="h-full w-12 flex items-center justify-center ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"#2f2f2fb9":"#919192"} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                            <div className="h-full w-full flex items-center ">
                                <input
                                        onChange={handleOllamaSearch}
                                        value={ollamaSearch}
                                        placeholder="Enter a model name"
                                        className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent py-[2px] dark:placeholder:text-[#919192] dark:text-[#bfbfbf]"
                                    />
                            </div>
                        </div>
                        <div className="bg-gray-400 h-[1px] dark:bg-[#2E2E2E]"></div>
                        <div className="  h-[375px] flex ">
                            <div className="w-[259px] h-[330px] ">
                                <div className="w-full h-full overflow-auto py-1 scroll-smooth">
                                    {
                                        // list model and filter it
                                        ollamaModelList.filter((model) => joinValue(model).toLowerCase().includes(ollamaSearch.toLowerCase())).map((model, index) => {
                                            return <OllamaModel key={index} name={model.name} description={model.description} active={model.name === cursorModel} action={handleCursor}/>
                                        })
                                    }
                                </div>
                            </div>
                            <Preview cursorModel={cursorModel} />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}