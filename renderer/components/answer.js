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


  return (
    <div>
      {formattedLines.map((line, index) => (
        <div key={uid()}>
          {

            line.includes("```") ?
            <CodeText key={uid()} className={"border rounded-md bg-[#1F1F1D] text-sm overflow-auto "}>{line.slice(3, -3)}</CodeText>
            :
            <ParsedText>
                {line}   
            </ParsedText>

            // line.split("**").map((part, id) => (
            //     index % 2 === 0 ? 
            //         <>
            //         {
            //            ( part === "") ? 
            //                 <br key={id}/> 
            //                 : 
            //                 <>
            //                     {
            //                        (part.includes("```")) ?
            //                         <CodeText key={uid()} className={"border rounded-md bg-[#1F1F1D] text-sm overflow-auto "}>{part.slice(3, -3)}</CodeText>
            //                         :
            //                         <span key={uid()}>
            //                             {part}
            //                         </span>
            //                     }
            //                 </>
            //         }
            //         </>
            //         : 
            //         <> 
            //             <span key={uid()} className="">{part}</span>
            //         </>
            // )
            // )
          }
        </div>
      ))}
      {/* {answer} */}
    </div>
  );
})

export default Answer;