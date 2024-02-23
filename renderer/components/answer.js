import { useEffect, useState } from "react";
import { parseLink } from "../pages/api/methods";

export default function Answer({ answer }) {
  const [formattedLines, setFormattedLines] = useState([]);

  useEffect(() => {

    console.log(answer);
    if (answer) {
      const lines = answer.split('\n');
      const linesWithLinksParsed = lines.map(line => parseLink(line));
      const linesWithBoldFormatted = linesWithLinksParsed.map(line => line.replace(/\*\*(.*?)\*\*/g, '**$1**'));
      setFormattedLines(linesWithBoldFormatted);
    //   console.log("-----", linesWithLinksParsed);
    }
  }, [answer]);


  return (
    <div>
      {formattedLines.map((line, index) => (
        <div key={index}>
          {line.split("**").map((part, index) => (
            index % 2 === 0 ? 
                <>
                {
                    part === "" ? <br/> : <span key={index}>{part}</span>
                }
                </>
                : 
                <>
                    <span key={index} className="font-bold">{part}-bold</span>
                </>
          ))}
        </div>
      ))}
      {/* {answer} */}
    </div>
  );
}
