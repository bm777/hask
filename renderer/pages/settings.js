import { useEffect, useState } from "react";
import Provider from "../components/provider";
import { store, retrieve } from "./api/methods";

export default function Settings() {
    const [log, setLog] = useState("")
    const [provider, setProvider] = useState("perplexity");
    const [token, setToken] = useState("");
    const [models, setModels] = useState(["pplx-7b-online", "pplx-70b-online"]);
    const [model, setModel] = useState(models[0]);

    const [pplxToken, setPplxToken] = useState("");
    const [pplxModel, setPplxModel] = useState("");
    const [pplxModels, setPplxModels] = useState(["pplx-7b-online", "pplx-70b-online"]);

    // const [groqToken, setGroqToken] = useState("");
    // const [groqModel, setGroqModel] = useState("");
    // const [groqModels, setGroqModels] = useState(["Mixtral 8x7B-32k", "Llama 2 70B-4k"]);

    // const [openaiToken, setOpenaiToken] = useState("");
    // const [openaiModel, setOpenaiModel] = useState("");
    // const [openaiModels, setOpenaiModels] = useState(["gpt-3.5-turbo", "gpt-4"]);

    // const [cohereToken, setCohereToken] = useState("");
    // const [cohereModel, setCohereModel] = useState("");
    // const [cohereModels, setCohereModels] = useState(["Turing-I", "Turing-I"]);


    useEffect(() => {
        // try to load the token and model from local storage
        const _provider = localStorage.getItem("provider");
        setProvider( _provider ? _provider : "perplexity" )
        console.log(_provider, provider);

        // check if provider is defined
        if (provider === "perplexity") {
            const _token = localStorage.getItem("pplx-token");
            const _model = localStorage.getItem("pplx-model");
            console.log("model", _model);
            if (_token) { setToken(_token); setPplxToken(_token); }
            if (_model) { setModel(_model); setPplxModel(_model); setModels(pplxModels);}
        } else { // if the provide is not provied or other model is stored
            // setModels([]);
        }
    }
    , []);

    const handleTokenChange = (e) => { 
        setToken(e.target.value);
    }
    const handleModelChange = (e) => {
        setModel(e.target.value);
    }
    const handleSave = async () => {
        if (provider === "perplexity") {
            console.log(provider, token, model);
            localStorage.setItem("provider", provider);
            localStorage.setItem("pplx-token", token);
            localStorage.setItem("pplx-model", model);
            setLog("Configuration Saved!");
            await new Promise(r => setTimeout(r, 4000));
            setLog("");
        }
    }

    const handleTabChange = (provider) => {
        // temporary blockage of switching providers
        if (provider !== "perplexity") {
            return;
        }
        setProvider(provider);
        if (provider === "perplexity") {
            setToken(pplxToken);
            setModel(pplxModel);
            setModels(pplxModels);
        } else {
            // setModels([]);
        }
    }
    return (
        <div className="w-screen h-screen bg-[#e0e5f6] flex flex-col">
            <div className=" h-20 flex items-center justify-center gap-3">
                <div className="bg-[#c5ccdb9a] rounded-md px-6 py-2 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000af" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                    </svg>

                    <span className="text-gray-600">Settings</span>
                </div>
            </div>

            <div className="border-t mt-1 border-gray-400 flex-1 flex flex-col items-center">
                <div className="w-full mt-1 gap-1 h-[50px] flex justify-center border-b border-gray-400 ">

                    <Provider active={provider === "perplexity"} provider={"Perplexity"} handleTabChange={handleTabChange} />
                    <Provider active={provider === "-groq"} provider={"Groq"} handleTabChange={handleTabChange} />
                    <Provider active={provider === "-openai"} provider={"OpenAI"} handleTabChange={handleTabChange} />
                    <Provider active={provider === "-cohere"} provider={"Cohere"} handleTabChange={handleTabChange} />

                </div>
                
                <div className="w-full mt-8 gap-1 flex justify-center border">
                    <div className="h-7 w-[20%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">API-Key:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <input
                                onChange={handleTokenChange}
                                value={token}
                                placeholder="Paste your API-Key here..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center border ">
                    <div className="h-7 w-[20%] flex items-center ">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">model:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center bg-gray-400/10 border border-gray-900/20 rounded">
                        <select onChange={handleModelChange} value={model} className="w-full h-full bg-transparent rounded-md text-black placeholder:text-gray-500/80 focus:outline-none">
                            {
                                models.map((model, index) => {
                                    return <option key={index} className=" ">{model}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                <div className="w-full mt-5 gap-1 flex justify-center border ">
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
                        <p className="w-full text-gray-500 text-sm font-medium ">Groq is faster than OpenAI, Gemini and Cohere</p>
                        <p className="w-full text-gray-500 text-center text-sm ">Waiting for the access to integrate it!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}