import { useEffect, useState } from "react";
import ModelItem from "../cards/modelItem";
import Download from "../cards/download";
import { ollamaModelList } from "../../pages/api/constant";
import { getOllamaTags, isLatest, pullOllamaModel } from "../../pages/api/methods";


export default function Preview({ cursorModel }) {
    const [btnStatus, setBtnStatus] = useState("download")
    const [modelName, setModelName] = useState("--")
    const [modelDescription, setModelDescription] = useState("Empty")
    const [modelSize, setModelSize] = useState("--")
    const [modelParams, setModelParams] = useState("--")
    const [modelQ, setModelQ] = useState("--")
    const [modelFamily, setModelFamily] = useState("--")
    const [progress, setProgress] = useState(0)
    const [descProgress, setDescProgress] = useState("--/--")
    const [status, setStatus] = useState("")

    useEffect(() => {
        loadModelCard()
        checkStatus()
    }, [cursorModel])

    const loadModelCard = () => {
        if (cursorModel) {
            const model = ollamaModelList.find((m) => m.name === cursorModel)
            setModelName(model.name)
            setModelDescription(model.description)
            setModelSize(model.s)
            setModelParams(model.params)
            setModelQ(model.q)
            setModelFamily(model.family)
        }
    }
    const checkStatus = async () => {
        setStatus("checking status...")
        const _local_models = await getOllamaTags(true)
        const _match_local_model = _local_models.find((m) => m.model.split(":")[0] === cursorModel)
        const _digest = _match_local_model && _match_local_model.digest
        
        if (_digest) {        
            let isUpdated = await isLatest(_match_local_model.model, _digest)
            window.ipc.send("logger", [isUpdated])
            setStatus(isUpdated ? "Up to date" : "Update available")
            setBtnStatus(isUpdated ? "Up to date" : "Update now")
            setDescProgress("100%")
            setProgress(100)
        } else {
            setStatus("ready to downlaod")
            setBtnStatus("download")
            setProgress(0)
            setDescProgress("")
        }
    }

    const handlePull = async () => { 
        let FLAG_DONE = false
        if(!FLAG_DONE) {
            const request = {
                model: cursorModel,
                stream: true,
                insecure: false,
            };
            const response = await pullOllamaModel(request)
            
            for await (const message of response) {
                if(message.status !== "success") {
                    if(message.completed && message.total) {
                        setStatus("Downloading...")
                        const percent = (message.completed / message.total) * 100
                        setProgress(parseInt(percent))
                        setDescProgress(`${percent.toFixed(1)}%`)
                        window.ipc.send("logger", [parseInt(percent)])
                    }
                } else {
                    FLAG_DONE = true
                    setProgress(100)
                    setStatus("Done")
                    window.ipc.send("logger", ["finshed"])
                    break
                }
            }
        }
    }

    return (
            <div className="border-l border-[#2e2e2e8c] w-[465px] h-[330px] pl-1 flex flex-col">
                <div className="flex flex-col py-1 h-[180px] relative">
                    <p className="text-3xl truncate px-2">{modelName}</p>
                    <p className="text-xs text-wrap mt-1 px-2 text-[#2f2f2fa3] max-h-[40%] overflow-auto dark:text-[#A7A6A8] ">
                        {modelDescription}
                    </p>
                    <div className="h-[40px] w-full mt-1 flex items-center justify-between p-1 absolute bottom-1">
                        <div className="h-full flex items-center gap-2 overflow-auto">
                            <ModelItem category={"family"} label={modelFamily} />
                            <ModelItem category={"params"} label={modelParams}/>
                            <ModelItem category={"q"} label={modelQ}/>
                            <ModelItem category={"size"} label={modelSize}/>
                        </div>
                        <div className="">
                            {
                                modelName !== "--" && <Download label={btnStatus} action={handlePull}/>
                            }
                        </div>
                    </div>
                </div>
                
                <div className=" px-2 bg-gray-400 h-[1px] dark:bg-[#2E2E2E]"></div>
                <div className=" h-[150px] w-[465px] flex items-center justify-center relative">
                    <div className=" h-[120px] w-[465px] border flex items-center rounded-xl border-gray-400 relative dark:border-[#2e2e2eac]">
                        <div className="absolute h-7 rounded-bl-xl px-4 text-xs top-0 right-0 flex items-center text-[#FF5F57] bg-[#2f2f2f1d] border-l border-b border-[#8181814b] dark:bg-[#2c2b2f2e]">{modelName !== "--" && status}</div>
                        <div className="h-[100px] w-[100px] flex items-center justify-center">
                            <div className="border rounded-full h-[70%] w-[70%] flex items-center justify-center border-gray-400 dark:border-[#3c3c3c]">
                                <div className=" rounded-full h-[90%] w-[90%] bg-gray-400 flex items-center justify-center dark:bg-[#2e2e2eac]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#949497" viewBox="0 0 256 256">
                                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="h-[100px] w-[365px] flex items-center ">
                            <div className=" h-[70px] w-full">
                                <div className=" h-[50px] flex justify-between">
                                    <div className=" h-full flex items-center">
                                        <div className="text-[#2f2f2fa3] dark:text-[#A7A6A8]">{descProgress}</div>
                                    </div>
                                    {/* <div className="h-[70%] rounded-md px-4 text-xs flex items-center text-[#FF5F57] bg-[#2f2f2f1d] border border-[#8181814b] dark:bg-[#2c2b2f2e] mr-2">Downloading</div> */}
                                </div>
                                <div className="h-[20px] mr-2 flex items-center">
                                    <div className="w-full h-2 rounded-full bg-[#ff5f5725] flex items-center">
                                        <div className={"h-2 rounded-full bg-[#ff5f57] "} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

}