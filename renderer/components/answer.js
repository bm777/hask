import { useEffect, useState, useRef } from "react";
import { parseLink } from "../pages/api/methods";
import CodeText from "../components/codetext";
import { get_code_blocks } from "../pages/api/methods";
import { useTheme } from "next-themes";
import React from "react";
import { v4 as uid } from 'uuid';
import DOMPurify from 'dompurify';
import showdown from 'showdown';
import ParsedText from './parsedText';
import { v4 as uuidv4 } from 'uuid';


const Answer = ({ answer, searching }) => {
    const [formattedLines, setFormattedLines] = useState([]);
    const [status, setStatus] = useState("copy");
    const { theme } = useTheme();
    const converter = new showdown.Converter();
    const [tableData, setTableData] = useState([]);
    const [tableContent, setTableContent] = useState(null);
    const [iframeVisible, setIframeVisible] = useState(false);
    const webviewContainerRef = useRef(null);

    const purify = (line) => {
        if (line.trim().startsWith('+')) {
            if (line.match(/^\t\+\s*/)) {
                const content = line.replace(/^\t\+\s*/, '');
                const sublist = `<ul><ul><li>${converter.makeHtml(content)}</li></ul></ul>`;
                return DOMPurify.sanitize(sublist);
            }
        }
        if (line.startsWith('    -')) {
            if (line.match(/^ {4}-\s*/)) {
                const content = line.replace(/^ {4}-\s*/, '');
                const sublist = `<ul><ul><li>${converter.makeHtml(content)}</li></ul></ul>`;
                return DOMPurify.sanitize(sublist);
            }
        }

        if (line.startsWith("|")) {
            if (line.match(/^\|.*\|.*\|.*$/)) {
                const content = line.split("|").map((item) => item.trim());
                const table = content.map((item, index) => {
                    if (item === "") return;
                    if (index === 0) {
                        return `${converter.makeHtml(item)}`;
                    } else {
                        if (item.includes("---")) {
                            return;
                        }
                        return `<td>${converter.makeHtml(item)}</td>`;
                    }
                }).join('');
                setTableData(prevData => [...prevData, `<tr>${table}</tr>`]);
                return null;
            } else {
                return DOMPurify.sanitize(converter.makeHtml(line));
            }
        }

        const html = converter.makeHtml(line);
        return DOMPurify.sanitize(html, { ALLOWED_ATTR: ['start', 'target', 'href'] });
    }

    useEffect(() => {
        if (answer) {
            const lines = answer.split("\n");
            let newFormattedLines = [];
            let isInsideCodeBlock = false;
            let codeBlockLines = [];

            lines.forEach((line) => {
                if (line.startsWith("```")) {
                    isInsideCodeBlock = !isInsideCodeBlock;
                    if (!isInsideCodeBlock) {
                        // End of a code block
                        newFormattedLines.push(<CodeText key={uuidv4()}>{codeBlockLines.join('\n')}</CodeText>);
                        codeBlockLines = []; // Reset the code block lines
                    }
                } else if (isInsideCodeBlock) {
                    codeBlockLines.push(line);
                } else {
                    // Regular line
                    const purifiedLine = purify(line);
                    if (purifiedLine) {
                        newFormattedLines.push(<ParsedText key={uuidv4()} text={purifiedLine} />);
                    }
                }
            });

            // If the answer ends inside a code block, add the remaining lines as a code block
            if (isInsideCodeBlock && codeBlockLines.length > 0) {
                newFormattedLines.push(<CodeText key={uuidv4()}>{codeBlockLines.join('\n')}</CodeText>);
            }

            setFormattedLines(newFormattedLines);
        }
    }, [answer]);



    const openLinkInNewTab = (event, url) => {
        event.preventDefault();
        window.open(url, '_blank', 'width=800,height=600,resizable=yes');
    };

    const openLinkInSameWindow = (event, url) => {
        event.preventDefault();
        // Ensure the container is empty before inserting a new webview
        if (webviewContainerRef.current) {
            webviewContainerRef.current.innerHTML = ''; // Clear the container
            const webview = document.createElement('webview');
            webview.src = url;
            webview.style.width = '100%';
            webview.style.height = '100vh';
            webview.style.border = 'none';
            webviewContainerRef.current.appendChild(webview);
        }
        showNavigationBar();
        hideContent();
        setIframeVisible(true);
    };


    const showNavigationBar = (iframe) => {
        const backButton = document.createElement('button');
        backButton.innerHTML = '&#8592; Back';
        backButton.classList.add('back-button');
        backButton.style.position = 'fixed';
        backButton.style.bottom = '40px'; // Moved to the top left
        backButton.style.left = '15px';
        backButton.style.zIndex = '9999';
        backButton.style.padding = '10px 15px';
        backButton.style.fontSize = '16px';
        backButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Light and transparent red
        backButton.style.border = '1px solid rgba(255,0,0,0.2)';
        backButton.style.borderRadius = '4px';
        backButton.style.cursor = 'pointer';
        backButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        backButton.setAttribute('aria-label', 'Go back'); // Accessibility enhancement

        // Hover effect
        backButton.onmouseover = function () {
            this.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Lighten on hover
            this.style.border = '1px solid rgba(255,0,0,0.3)'; // Slightly darker border on hover
        };
        backButton.onmouseout = function () {
            this.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Revert to original styles
            this.style.border = '1px solid rgba(255,0,0,0.2)';
        };

        document.body.appendChild(backButton);

        backButton.addEventListener('click', () => {
            // Correctly targeting the webviewContainerRef to clear the webview
            if (webviewContainerRef.current) {
                webviewContainerRef.current.innerHTML = ''; // This removes the webview
            }
            backButton.remove(); // Removing the back button itself
            showContent(); // Showing the main content again
            setIframeVisible(false); // Updating state to reflect the UI change
        });

    };

    const hideContent = () => {
        const answerContent = document.querySelector('.answer-content');
        answerContent.style.display = 'none';
    };

    const showContent = () => {
        const answerContent = document.querySelector('.answer-content');
        answerContent.style.display = 'block';
    };

    useEffect(() => {
        const links = document.querySelectorAll('.markdown-body a');
        links.forEach(link => {
            link.addEventListener('click', (event) => {
                if (event.metaKey || event.ctrlKey) {
                    openLinkInNewTab(event, link.href);
                } else {
                    openLinkInSameWindow(event, link.href);
                }
            });
        });

        return () => {
            links.forEach(link => {
                link.removeEventListener('click', (event) => {
                    if (event.metaKey || event.ctrlKey) {
                        openLinkInNewTab(event, link.href);
                    } else {
                        openLinkInSameWindow(event, link.href);
                    }
                });
            });
        };
    }, [formattedLines]);

    useEffect(() => {
        if (tableData.length > 0) {
            setTableContent(tableData.join(""));
        }
    }, [tableData]);

    const copied = () => {
        navigator.clipboard.writeText(answer).then(function () {
            setStatus("copied");
            setTimeout(() => { setStatus("copy"); }, 1000);
        }, function (err) {
            setStatus("error");
            setTimeout(() => { setStatus("copy"); }, 1000);
        });
    }

    const processLine = (line, index, array) => {
        // Check if the current line starts a code block
        if (line.startsWith("```")) {
            setIsCodeBlock(!isCodeBlock);

            // If ending a code block, send the accumulated lines to CodeText
            if (!isCodeBlock) {
                const completeCodeBlock = codeBlockContent.join("\n") + "\n" + line;
                setCodeBlockContent([]);
                return <CodeText key={uuidv4()}>{completeCodeBlock}</CodeText>;
            }
        } else if (isCodeBlock) {
            // If currently in a code block, accumulate the content
            setCodeBlockContent([...codeBlockContent, line]);

            // If this is the last line and we're still in a code block, close it off
            if (index === lines.length - 1) {
                setIsCodeBlock(false);
                const completeCodeBlock = codeBlockContent.join("\n");
                setCodeBlockContent([]);
                return <CodeText key={uuidv4()}>{completeCodeBlock}</CodeText>;
            }

            // Don't return anything yet as we are accumulating lines for the code block
            return null;
        } else {
            // Regular line processing
            const purified = purify(line);
            return purified ? <ParsedText key={uuidv4()} text={purified} /> : null;
        }
    };


    const saveAnswer = () => {
        const blob = new Blob([answer], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'answer.txt';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const handleContextMenuCommand = (event, command) => {
            if (command === 'copy') {
                // Handle the "Copy" command
                copied();
            } else if (command === 'save') {
                // Handle the "Save" command
                saveAnswer();
            }
        };

        window.ipc.on('context-menu-command', handleContextMenuCommand);

        return () => {
            window.ipc.removeListener('context-menu-command', handleContextMenuCommand);
        };
    }, [answer]);

    return (
        <div className="relative">
            <div className={`answer-content ${iframeVisible ? 'hidden' : ''}`}>
                {tableContent && (<div className="placeholder">Table is below</div>)}
                {formattedLines}
                {tableContent && (
                    <div className="w-full mt-3 mb-1 border-b border-b-1 border-gray-400 duration-700 dark:border-gray-500/30"></div>
                )}
                {tableContent && (
                    <div className="bg-light-table p-2 rounded-md mt-2 relative overflow-auto duration-700 dark:bg-code">
                        <table className="rounded text-sm text-gray-400 dark:text-current ">
                            <tbody dangerouslySetInnerHTML={{ __html: tableContent }} />
                        </table>
                    </div>
                )}

                <div className={"w-full flex items-center justify-end absolute -bottom-7 ml-3 transition-all duration-500 " + (answer === "" ? "scale-0" : "scale-100")}>
                    <div onClick={copied} className="response-copy-button flex py-[1px] px-2 bg-grayish/20 border border-gray-700/20 rounded dark:bg-gray-300/20 hover:cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#B4B4B4" className="w-[14px] h-[14px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                        <span className="text-sm"> {status} </span>
                    </div>

                </div>
            </div>
            <div className="webview-container" ref={webviewContainerRef} style={{ width: '100%', height: '100vh', display: iframeVisible ? 'block' : 'none' }}></div>
        </div>
    );

}

export default Answer;