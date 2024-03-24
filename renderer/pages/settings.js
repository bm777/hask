import { useEffect, useState } from "react";
import { 
    pplxModelList, 
    groqModelList, 
    ollamaModelList as defaultOllamaModelList, 
    openaiModelList, 
    anthropicModelList,
    cohereModelList
} from "./api/constant";
import { useTheme } from "next-themes";
import OllamaModel from "../components/buttons/ollamaModel";
import { joinValue, getOllamaTags, capitalize } from "./api/methods";
import Preview from "../components/cards/modelPreview";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [menu, setMenu] = useState("general");
    const providers = ["perplexity", "cohere", "openai", "groq", "anthropic", "ollama" ];

    const [log, setLog] = useState("")
    const [provider, setProvider] = useState("perplexity");
    const [token, setToken] = useState("");
    const [models, setModels] = useState(pplxModelList);
    const [model, setModel] = useState("pplx-7b-online");
    const [systemPrompt, setSystemPrompt] = useState("Be precise and concise.");
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(900);
    const [showMore, setShowMore] = useState(false);

    // ollama setting
    const [ollamaSearch, setOllamaSearch] = useState("");
    const [cursorModel, setCursorModel] = useState("");
    const [OllamaPreview, setOllamaPreview] = useState(false);
    const [notifView, setNotifView] = useState(false);
    const [notifTitle, setNotifTitle] = useState("One step");
    const [notifSubtitle, setNotifSubtitle] = useState("Configuration is being done. Please wait...");

    const [pplxStatus, setPplxStatus] = useState(true);
    const [cohereStatus, setCohereStatus] = useState(true);
    const [openaiStatus, setOpenaiStatus] = useState(true);
    const [groqStatus, setGroqStatus] = useState(false);
    const [anthropicStatus, setAnthropicStatus] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState(false);


    useEffect(() => {
        // try to load the token and model from local storage
        const _provider = localStorage.getItem("provider");
        setProvider(  _provider === null ?  "perplexity" : _provider )
        if (_provider === null) { localStorage.setItem("provider", "perplexity"); }
        
        if (_provider === "perplexity") {
            configurePerplexity();
        } else if (_provider === "groq") {
            configureGroq();
        } else if (_provider === "ollama") {
            configureOllama();
        } else if (_provider === "openai") {
            configureOpenai();
        } else if (_provider === "anthropic") {
            configureAnthropic();
        } else if (_provider === "cohere") {
            configureCohere();
        }

        window.ipc.send("ping-ollama"); // ping ollama to check if it's ready
        window.ipc.on("ollama-reply", async (arg) => {
            if (arg === "ollama-ready") { 
                window.ipc.send("ollama-ready");
                
                setNotifTitle("Configure your keys")
                setNotifSubtitle("Collect the api-key from your provider!")
            }
            if (arg === "installing-ollama") { 
                setNotifView(true);
            }
        })

    }, [provider]);

    const handleTokenChange = (e) => { setToken(e.target.value); }
    const handleModelChange = (e) => { setModel(e.target.value); }
    const handleSystemPrompt = (e) => { setSystemPrompt(e.target.value); }
    const handleTemperature = (e) => { setTemperature(parseFloat(e.target.value));}
    const handleMaxTokens = (e) => {setMaxTokens(parseInt(e.target.value));}
    const handleMenu = (menu) => { setMenu(menu); }

    const saveLocal = () => {
        let list_key_value = [];
        if (provider === "perplexity") {
            list_key_value = [
                ["provider", provider], ["pplx-token", token], ["pplx-model", model], 
                [`pplx-system-prompt`, systemPrompt],["pplx-temperature", temperature],
                ["pplx-max-tokens", maxTokens]
            ];
         } else if (provider === "groq") {
            list_key_value = [
                ["provider", provider], ["groq-token", token], ["groq-model", model], 
                [`groq-system-prompt`, systemPrompt],["groq-temperature", temperature],
                ["groq-max-tokens", maxTokens]
            ];
        } else if (provider === "ollama") {
            list_key_value = [
                ["provider", provider], ["ollama-token", token], ["ollama-model", model], 
                [`ollama-system-prompt`, systemPrompt],["ollama-temperature", temperature],
                ["ollama-max-tokens", maxTokens]
            ];
        } else if (provider === "openai") {
            list_key_value = [
                ["provider", provider], ["openai-token", token], ["openai-model", model], 
                [`openai-system-prompt`, systemPrompt],["openai-temperature", temperature],
                ["openai-max-tokens", maxTokens]
            ];
        } else if (provider === "anthropic") {
            list_key_value = [
                ["provider", provider], ["anthropic-token", token], ["anthropic-model", model], 
                [`anthropic-system-prompt`, systemPrompt],["anthropic-temperature", temperature],
                ["anthropic-max-tokens", maxTokens]
            ];
        } else if (provider === "cohere") {
            list_key_value = [
                ["provider", provider], ["cohere-token", token], ["cohere-model", model],
                [`cohere-system-prompt`, systemPrompt],["cohere-temperature", temperature],
                ["cohere-max-tokens", maxTokens]
            ];
        }
        list_key_value.forEach((item) => {
            localStorage.setItem(item[0], item[1]);
        });
        localStorage.setItem("pplx-status", pplxStatus.toString());
        localStorage.setItem("groq-status", groqStatus.toString());
        localStorage.setItem("ollama-status", ollamaStatus.toString());
        localStorage.setItem("openai-status", openaiStatus.toString());
        localStorage.setItem("anthropic-status", anthropicStatus.toString());
        localStorage.setItem("cohere-status", cohereStatus.toString());
    }
    const handleSave = async () => {
        saveLocal();
        
        window.ipc.send("relaunch-hask");
        setLog("Configuration Saved!");
        await new Promise(r => setTimeout(r, 2000));
        setLog("");
    }
    const handleCheckChange = (e) => {
        const prov = e.target.value
        window.ipc.send("logger", [e.target.value, e.target.checked]);
        if (prov === "perplexity") {
            setPplxStatus(e.target.checked);
        } else if (prov === "groq") {
            setGroqStatus(e.target.checked);
        } else if (prov === "ollama") {
            setOllamaStatus(e.target.checked);
        } else if (prov === "openai") {
            setOpenaiStatus(e.target.checked);
        } else if (prov === "anthropic") {
            setAnthropicStatus(e.target.checked);
        } else if (prov === "cohere") {
            setCohereStatus(e.target.checked);
        }
    }
    const configurePerplexity = () => {
        setToken(localStorage.getItem("pplx-token") || "");
        setModel(localStorage.getItem("pplx-model") || pplxModelList[0]); // default model for the first time configuration
        setModels(pplxModelList);
        setSystemPrompt(localStorage.getItem("pplx-system-prompt") || "Answer the query after carefully parsing the search results to identify relevant information. Only make definitive statements if concretely supported by the information at hand. Be comprehensive while avoiding overly descriptive language. Employ bullet points and other **formatting stylisations** for clarity. Use British English spelling and the metric system. Ensure responses are aligned with the Current date.");
        setTemperature(localStorage.getItem("pplx-temperature") || temperature);
        setMaxTokens(localStorage.getItem("pplx-max-tokens") || maxTokens);
    }
    const configureGroq = () => {
        setToken(localStorage.getItem("groq-token") || "");
        setModel(localStorage.getItem("groq-model"));
        setModels(groqModelList);
        setSystemPrompt(localStorage.getItem("groq-system-prompt") || "Be precise and concise.");
        setTemperature(localStorage.getItem("groq-temperature") || temperature);
        setMaxTokens(localStorage.getItem("groq-max-tokens") || maxTokens);
    }
    const configureOllama = async () => {
        setModels(["loading..."]);
        const interval = setInterval(async () => {
            const tags = await getOllamaTags();
            if(tags.length === 0) {
                setModels([]);
                setModel("");
            } else {
                if (tags[0] !== "loading...") {
                    setModels(tags);
                    setModel(localStorage.getItem("ollama-model") || tags[0]);
                    clearInterval(interval);
                } else {
                    setModels(["loading..."]);
                    setModel("");
                }
            }
        }, 1000);
        setSystemPrompt(localStorage.getItem("ollama-system-prompt" || "Be precise and concise."));
        setTemperature(localStorage.getItem("ollama-temperature") || temperature);
        setMaxTokens(localStorage.getItem("ollama-max-tokens") || maxTokens);
    }
    const configureOpenai = () => {
        setToken(localStorage.getItem("openai-token") || "");
        setModel(localStorage.getItem("openai-model") || "gpt-3.5-turbo");
        setModels(openaiModelList)
        setSystemPrompt(localStorage.getItem("openai-system-prompt") || "Be precise and concise.");
        setTemperature(localStorage.getItem("openai-temperature") || temperature);
        setMaxTokens(localStorage.getItem("openai-max-tokens") || maxTokens);
    }
    const configureAnthropic = () => {
        setToken(localStorage.getItem("anthropic-token") || "");
        setModel(localStorage.getItem("anthropic-model") || "claude-2.1");
        setModels(anthropicModelList)
        setSystemPrompt(localStorage.getItem("anthropic-system-prompt") || "Be precise and concise.");
        setTemperature(localStorage.getItem("anthropic-temperature") || temperature);
        setMaxTokens(localStorage.getItem("anthropic-max-tokens") || maxTokens);
    }
    const configureCohere = () => {
        setToken(localStorage.getItem("cohere-token") || "");
        setModel(localStorage.getItem("cohere-model") || "cohere-2.1");
        setModels(cohereModelList)
        setSystemPrompt(localStorage.getItem("cohere-system-prompt") || "Be precise and concise.");
        setTemperature(localStorage.getItem("cohere-temperature") || temperature);
        setMaxTokens(localStorage.getItem("cohere-max-tokens") || maxTokens);
    }
    const handleTabChange = async (prov) => {
        setProvider(prov);
        localStorage.setItem("provider", prov);
        if (prov === "perplexity") {
            configurePerplexity();
        } 
        else if (prov === "groq") {
            configureGroq();
        } 
        else if (prov === "ollama") {
            await configureOllama();
        }
        else if (prov === "openai"){
            configureOpenai();
        } else if (prov === "anthropic") {
            configureAnthropic();
        } else if (prov === "cohere") {
            configureCohere();
        }
        // console.log("provider", provider, "prov", prov);
    }
    const handleThemeChange = (e) => {
        window.ipc.send("logger", e.target.value);
        setTheme(e.target.value);
    }

    const handleOllamaSearch = (e) => {setOllamaSearch(e.target.value);}
    const handleCursor = (new_cursor) => {setCursorModel(new_cursor);}

    return (
        <div className="w-screen h-screen bg-[#e0e5f6] flex flex-col dark:bg-[#19171B] relative">
            <div className=" h-20 flex items-center justify-center gap-3">
                <div onClick={() => handleMenu("general")} className={"hover:cursor-default rounded-md px-6 py-2 flex flex-col items-center justify-center " + (menu === "general" ? " bg-[#c5ccdb9a] dark:bg-[#2C2B2F]" : "")}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"#1a202cb1":"#A7A6A8"} className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                    </svg>
                    <span className="text-gray-600 dark:text-[#A7A6A8]">General</span>
                </div>
                <div onClick={() => handleMenu("provider")} className={"hover:cursor-default rounded-md px-6 py-2 flex flex-col items-center justify-center " + (menu === "provider" ? " bg-[#c5ccdb9a] dark:bg-[#2C2B2F]" : "") }>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"#1a202cb1":"#A7A6A8"} className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                    <span className="text-gray-600 dark:text-[#A7A6A8]">Providers</span>
                </div>
            </div>
            {
                menu === "general" &&
                <div className="border-t mt-1 border-gray-400 flex-1 flex flex-col items-center dark:border-t-[#2E2E2E]">
                    <div className="w-full mt-2 gap-1 h-7 flex justify-center items-center ">
                        <div className={"w-full mt-1 gap-1 flex justify-center items-center " }>
                            <div className="h-7 w-[20%] flex items-center ">
                                <p className="w-full text-right text-gray-500 text-sm font-medium ">General settings:</p>
                            </div>
                            <div className="h-7 w-[50%] flex items-center text-right text-gray-500 text-sm font-medium ">
                                Personnal preferences.
                            </div>
                        </div>
                    </div>
                    <div className={"w-full mt-1 gap-1 flex justify-center "}>
                        <div className="h-7 w-[20%] flex items-center ">
                            <p className="w-full text-right text-gray-500 text-sm font-medium ">Theme:</p>
                        </div>
                        <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded relative">
                            <select onChange={handleThemeChange} defaultValue={theme || "dark"} className="w-full h-full bg-transparent rounded-md text-sm text-black placeholder:text-gray-500/80 focus:outline-none dark:text-[#A7A6A8]">
                                {
                                    ["light", "dark"].map((th, index) => {
                                        return <option key={index} value={th}>{th === "light" ? "Hask Light" : "Hask Dark"}</option>
                                    })
                                }
                            </select>
                            {
                                provider === "ollama" && 
                                <div onClick={() => setOllamaPreview(true)} className="border absolute -right-10 w-7 rounded-md flex items-center justify-center hover:cursor-pointer text-black border-gray-600/60 dark:text-[#A7A6A8]">
                                    + 
                                </div>
                            }
                        </div>
                    </div>
                    <div className="w-full mt-4  gap-1 flex justify-center ">
                        <div className="h-7 w-[20%] flex items-center">
                            <p className="w-full text-right text-gray-500 text-sm font-medium ">Providers:</p>
                        </div>
                        <div className="h-7 w-[50%] flex items-center">
                            <p className="text-gray-500 text-sm font-medium">Checked provider appear in the command bar.</p>
                        </div>
                    </div>
                    {
                        providers.map((prov, index) => {
                            return (
                            <div key={index} className="w-full mt-1 gap-1 flex justify-center ">
                                <div className="h-7 w-[20%] flex items-center"> </div>
                                <div className="h-7 w-[50%] flex items-center">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            defaultChecked={["perplexity", "cohere", "openai"].includes(prov)}
                                            onChange={handleCheckChange}
                                            value={prov.toLocaleLowerCase()}
                                            className="outline-none mx-2"
                                        /> 
                                        <label className="text-black dark:text-[#A7A6A8] text-sm">{capitalize(prov)}</label>
                                    </div>
                                </div>
                            </div>
                            )
                        })
                    }
                    <div className="w-full mt-5 gap-1 flex justify-center  ">
                        <div onClick={handleSave} className="transition border border-[#561d2a65] bg-[#FF5F57] hover:bg-[#b23e4f] px-10 h-7 hover:cursor-pointer text-[#561D2A] rounded text-sm flex items-center justify-center duration-200 transform">
                            {log==="" ? "Save" : log}
                        </div>
                    </div>

                </div>
            }
            {
                menu === "provider" &&
                <div className="border-t mt-1 border-gray-400 flex-1 flex flex-col items-center dark:border-t-[#2E2E2E] overflow-auto">
                    <div className="w-full mt-1 gap-1 h-[50px] flex justify-center items-center border-b border-gray-400 dark:border-b-[#2E2E2E] ">
                        <div className={"w-full mt-1 gap-1 flex justify-center " }>
                            <div className="h-7 w-[20%] flex items-center ">
                                <p className="w-full text-right text-gray-500 text-sm font-medium ">Provider:</p>
                            </div>
                            <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded relative">
                                <select onChange={(e)=>handleTabChange(e.target.value)} defaultValue={provider} className="w-full h-full bg-transparent rounded-md text-black placeholder:text-gray-500/80 focus:outline-none dark:text-[#A7A6A8]">
                                    {
                                        providers.map((prov, index) => {
                                            return <option key={index} className="" value={prov}>{capitalize(prov)}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-2 gap-1 h-7 flex justify-center items-center ">
                        <div className={"w-full mt-1 gap-1 flex justify-center items-center " }>
                            <div className="h-7 w-[20%] flex items-center ">
                                <p className="w-full text-right text-gray-500 text-sm font-medium ">Configuration:</p>
                            </div>
                            <div className="h-7 w-[50%] flex items-center text-right text-gray-500 text-sm font-medium ">
                                Parameters of {capitalize(provider)} model
                            </div>
                        </div>
                    </div>

                    {
                        provider !== "ollama" &&
                        <div className="w-full mt-1 gap-1 flex justify-center ">
                            <div className="h-7 w-[20%] flex items-center">
                                <p className="w-full text-right text-gray-500 text-sm font-medium ">API-Key:</p>
                            </div>
                            <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                                <input
                                        onChange={handleTokenChange}
                                        value={token}
                                        // defaultValue={""}
                                        placeholder="Paste your API-Key here..."
                                        className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                                    />  
                            </div>
                        </div>
                    }
                    <div className={"w-full mt-1 gap-1 flex justify-center " + (provider === "ollama" && "mt-1")}>
                        <div className="h-7 w-[20%] flex items-center ">
                            <p className="w-full text-right text-gray-500 text-sm font-medium ">model:</p>
                        </div>
                        <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded relative">
                            <select onChange={handleModelChange} value={model} className="w-full h-full bg-transparent rounded-md text-black placeholder:text-gray-500/80 focus:outline-none dark:text-[#A7A6A8]">
                                {
                                    models.map((model, index) => {
                                        return <option key={index} className=" ">{model}</option>
                                    })
                                }
                            </select>
                            {
                                provider === "ollama" && 
                                <div onClick={() => setOllamaPreview(true)} className="border absolute -right-10 w-7 rounded-md flex items-center justify-center hover:cursor-pointer text-black border-gray-600/60 dark:text-[#A7A6A8]">
                                    + 
                                </div>
                            }
                        </div>
                    </div>
                    <div onClick={() => setShowMore(!showMore)} className=" mt-1 gap-1 w-[100%] flex justify-center items-center hover:cursor-pointer ">
                        <div className="h-7 w-[20%] rounded-md text-sm flex items-center justify-end ">
                            <span className="text-gray-500 text-sm font-medium">Advanced</span>
                        </div>
                        <div className="w-[50%] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className={"w-5 h-5 duration-200 transform " + (showMore ? 'rotate-90' : '')}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>
                    </div>
                    {
                    showMore &&
                        <>
                            <div className="w-full mt-1 gap-1 flex justify-center ">
                                <div className="h-7 w-[20%] flex items-center">
                                    <p className="w-full text-right text-gray-500 text-sm font-medium ">System prompt:</p>
                                </div>
                                <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                                    <input
                                            onChange={handleSystemPrompt}
                                            value={systemPrompt}
                                            defaultValue={"Be precise and concise."}
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
                                            defaultValue={0.7}
                                            type="number"
                                            min={0}
                                            max={2}
                                            step={0.1}
                                            placeholder="Choose a temperature..."
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
                                            defaultValue={900}
                                            min={16}
                                            step={10}
                                            type="number"
                                            placeholder="900"
                                            className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px] dark:text-[#A7A6A8]"
                                        />  
                                </div>
                            </div>
                        </>
                    }
                    <div className="w-full mt-5 gap-1 flex justify-center  ">
                        <div onClick={handleSave} className=" border border-[#561d2a65] bg-[#FF5F57] hover:bg-[#b23e4f] px-10 h-7 hover:cursor-pointer text-[#561D2A] rounded text-sm flex items-center justify-center duration-200 transform">
                            {log==="" ? "Save" : log}
                            </div>
                    </div>

                    <div className="w-full mt-5 gap-1 flex justify-center fixed bottom-5">
                        <div className="h-7 flex flex-col justify-center">
                        </div>
                    </div>
                </div>
            }

            {
                OllamaPreview &&
                <div className="w-full h-full absolute flex items-center justify-center">
                    <div className="border border-gray-400 w-[740px] h-[400px] bg-[#e0e5f6] shadow-2xl shadow-black rounded flex flex-col dark:bg-[#19171b] dark:border-[#2E2E2E]">
                        <div className="h-6 draggable flex items-center rounded-t bg-gradient-to-r from-[#e0e5f6] to-[#9498a2] dark:from-[#1c1820] dark:to-[#19171b]">
                            <div onClick={() => setOllamaPreview(false)} className={`hover:bg-[#FF5F573f] h-4 w-4 ml-[4px] transition duration-100 rounded-full flex items-center bg-[#FF5F57] justify-center border border-[#8181814b] dark:hover:bg-[#FF5F573f]`}>
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
                                        defaultOllamaModelList.filter((model) => joinValue(model).toLowerCase().includes(ollamaSearch.toLowerCase())).map((model, index) => {
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
            {
                notifView &&
                    <div className="w-full h-full absolute flex items-center justify-center">
                        <div className="border border-gray-400 w-[500px] h-[175px] bg-[#e0e5f6] shadow-2xl shadow-black rounded flex flex-col dark:bg-[#19171b] dark:border-[#2E2E2E]">
                            <div className="h-6 draggable flex items-center rounded-t bg-gradient-to-r from-[#e0e5f6] to-[#9498a2] dark:from-[#1c1820] dark:to-[#19171b]">
                                <div onClick={() => setNotifView(false)} className={`hover:bg-[#FF5F573f] h-4 w-4 ml-[4px] transition duration-100 rounded-full flex items-center bg-[#FF5F57] justify-center border border-[#8181814b] dark:hover:bg-[#FF5F573f]`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme==="light" ?"black":"black"} className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <div className=" h-full w-full flex items-center justify-center">
                                <div className=" h-[120px] w-[465px] border flex items-center rounded-xl border-gray-400 relative dark:border-[#2e2e2eac]">
                                    <div className="h-[100px] w-[100px] flex items-center justify-center">
                                        <div className="border rounded-full h-[70%] w-[70%] flex items-center justify-center border-gray-400 dark:border-[#3c3c3c]">
                                            <div className=" rounded-full h-[90%] w-[90%] bg-gray-400 flex items-center justify-center dark:bg-[#2e2e2eac]">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#949497" className={"w-6 h-6 " + (notifTitle === "One step" ? "animate-bounce":"")}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[100px] w-[365px] flex items-center ">
                                        <div className=" h-[70px] w-full">
                                            <div className=" h-[100%]">
                                                <div className=" h-full">
                                                    <div className="text-[#2f2f2fa3] dark:text-[#A7A6A8] text-3xl truncate">{notifTitle}</div>
                                                    <div className="text-[#2f2f2fa3] dark:text-[#A7A6A8] flex-wrap">{notifSubtitle}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}