import { useEffect, useState } from "react";
import { parseLink } from "../pages/api/methods";
import CodeText from "../components/codetext";
import { get_code_blocks } from "../pages/api/methods";
import Prism from 'prismjs';
import React from "react";
import { v4 as uid } from 'uuid';
import ParsedText from "./parsedptext";



const Answer = React.memo(({ answer }) => {
    const [formattedLines, setFormattedLines] = useState([]);
    const [status, setStatus] = useState("copy");
    let flag = false;

    useEffect(() => {
        Prism.highlightAll();
        if (answer) {
            const codeBlockRegex = /```([\s\S]+?)```/g

            const lines = answer.split('\n');
            // const lines = codeBlocks.split('\n');
            const linesWithLinksParsed = lines.map(line => parseLink(line));

            // const linesWithBoldFormatted = linesWithLinksParsed.map(line => line.replace(/\*\*(.*?)\*\*/g, '**$1**'));
            const linesWithCodeBlocks = get_code_blocks(linesWithLinksParsed);
            
            setFormattedLines(linesWithCodeBlocks);
        }
    }, [answer]);

    const copied = () => {
        navigator.clipboard.writeText(answer).then(function() {
            setStatus("copied");
            setTimeout(() => {
                setStatus("copy");
            }, 1000);
        }, function(err) {
            setStatus("error");
            setTimeout(() => {
                setStatus("copy");
            }, 1000);
        });
    }


  return (
    <div className="relative">
      {formattedLines.map((line, index) => (
        <div key={uid()}>
          {

            line.includes("```") ?
            <CodeText key={uid()} className={"border rounded-md bg-[#1F1F1D] text-sm overflow-auto "}>{line.slice(3, -3)}</CodeText>
            :
            <ParsedText>
                {line}   
            </ParsedText>
          }
        </div>
      ))}

      <div className={" absolute w-full -bottom-3 ml-3 bg-transparent flex items-center justify-end transition-all duration-500  " + (answer === "" ? "scale-0" : "scale-100") }>
            <div onClick={copied} className="flex py-[1px] px-2 bg-[#2f2f2fa3] rounded"> 
                <div className="flex items-center justify-center  mr-2 gap-1 hover:cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#B4B4B4" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    <span className="text-sm text-[#B4B4B4]"> {status} </span>
                </div>
            </div>
        </div>
    </div>
  );
})

export default Answer;