import { useEffect, useState } from "react";

export default function Settings() {
    const [token, setToken] = useState("");
    const [modelType, setModelType] = useState("");

    useEffect(() => {
        const _token = localStorage.getItem("pplx-token");
        if (_token) {
            setToken(_token);
        }
    }
    , []);

    const handleTokenChange = (e) => { 
        setToken(e.target.value);
    }
    const handleSave = () => {
        localStorage.setItem("pplx-token", token);
    }

    return (
        <div className="w-screen h-screen bg-[#e0e5f6] flex flex-col">
            <div className=" h-20 flex items-center justify-center">
                <div className="bg-[#c5ccdb9a] rounded-md px-6 py-2 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000af" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                    </svg>

                    <span className="text-gray-600">Settings</span>
                </div>
            </div>

            <div className="border-t border-gray-400 flex-1 flex flex-col items-center ">
                <div className="w-full mt-5 gap-1 flex justify-center">title</div>
                <div className="w-full mt-1 gap-1 flex justify-center border border-green-500">
                    <div className="h-7 w-[30%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">PPLX API token:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center border border-gray-500 rounded">
                        <input
                                onChange={handleTokenChange}
                                value={token}
                                placeholder="Paste your PPLX API token here..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-1 gap-1 flex justify-center border border-green-500">
                    <div className="h-7 w-[30%] flex items-center">
                        <p className="w-full text-right text-gray-500 text-sm font-medium ">model:</p>
                    </div>
                    <div className="h-7 w-[50%] flex items-center border border-gray-500 rounded">
                        <input
                                onChange={handleTokenChange}
                                value={token}
                                placeholder="Paste your PPLX API token here..."
                                className="outline-none text-sm w-full placeholder:text-gray-500/80 font-medium bg-transparent border-r-1 mx-2 py-[2px]"
                            />  
                    </div>
                </div>
                <div className="w-full mt-5 gap-1 flex justify-center border border-green-500">
                    <div onClick={handleSave} className=" border border-[#561D2A] bg-[#FFB2BE] px-10 hover:cursor-pointer text-[#561D2A] rounded text-sm flex items-center justify-center">Save</div>
                </div>

                <div className="w-full mt-5 gap-1 flex justify-center fixed bottom-5">
                    <div className="h-7 flex flex-col justify-center">
                        <p className="w-full text-gray-500 text-sm font-medium ">When OpenAI, Gemini and Cohere will become fast as PPLX, I will add them!</p>
                        <p className="w-full text-gray-500 text-center text-sm ">Or you can make a request, I will do it for you :)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}