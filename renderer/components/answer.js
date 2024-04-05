import { useEffect, useState } from "react";
import { parseLink } from "../pages/api/methods";
import CodeText from "../components/codetext";
import { get_code_blocks } from "../pages/api/methods";
import { useTheme } from "next-themes";
import React from "react";
import { v4 as uid } from 'uuid';
import DOMPurify from 'dompurify';
import showdown from 'showdown';

const Answer = ({ answer, searching }) => {
    const [formattedLines, setFormattedLines] = useState([]);
    const [status, setStatus] = useState("copy");
    const { theme } = useTheme();
    const converter = new showdown.Converter();
    const [tableData, setTableData] = useState([]);
    const [tableContent, setTableContent] = useState(null);
    const [iframeVisible, setIframeVisible] = useState(false);

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
            let lines = answer.split("\n");
            const linesWithLinksParsed = lines.map(line => parseLink(line));
            const rg = /.*\|.*\|.*$/; // rg for checking if the line is a table
            const linesWithCodeBlocks = !rg.test(linesWithLinksParsed) ? linesWithLinksParsed : get_code_blocks(linesWithLinksParsed);

            if (answer === " " && searching) {
                setFormattedLines([]);
                setTableContent(null);
            } else {
                setFormattedLines(linesWithCodeBlocks.map(processLine));
            }
        }
    }, [answer]);

    const openLinkInNewTab = (event, url) => {
        event.preventDefault();
        window.open(url, '_blank', 'width=800,height=600,resizable=yes');
    };

    const openLinkInSameWindow = (event, url) => {
        event.preventDefault();
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100vh'; // Make the iframe fill the entire window height 
        iframe.style.border = 'none';
        const iframeContainer = document.querySelector('.iframe-container');
        iframeContainer.appendChild(iframe);
        showNavigationBar(iframe);
        hideContent();
        setIframeVisible(true);
    };

    const showNavigationBar = (iframe) => {
        const navigationBar = document.createElement('div');
        navigationBar.classList.add('navigation-bar');
        navigationBar.innerHTML = `
            <button class="back-button">&#8592;</button>
        `;
        navigationBar.style.position = 'absolute';
        navigationBar.style.top = '10px';
        navigationBar.style.left = '10px';
        navigationBar.style.zIndex = '9999';
        const iframeContainer = document.querySelector('.iframe-container');
        iframeContainer.appendChild(navigationBar);
    
        const backButton = navigationBar.querySelector('.back-button');
        backButton.addEventListener('click', () => {
            iframeContainer.removeChild(iframe);
            iframeContainer.removeChild(navigationBar);
            showContent();
            setIframeVisible(false);
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

    const processLine = (line) => {
        if (line === "") return <div key={uid()} className="h-2 bg-transparent" />;

        if (line.includes("```")) {
            return <CodeText key={uid()} >{line}</CodeText>;
        } else {
            const purified = purify(line)

            if (purified === null) {
                return null;
            }

            return (
                <div
                    key={uid()}
                    className="markdown-body text-sm"
                    dangerouslySetInnerHTML={{ __html: purified }}
                />
            );
        }
    };

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
                    <div onClick={copied} className="copy-button flex py-[1px] px-2 bg-grayish/20 border border-gray-700/20 rounded dark:bg-gray-300/20">
                        <div className="flex items-center justify-center mr-2 gap-1 hover:cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={theme === "light" ? "#2f2f2fa3" : "#ACABAE"} className="w-[14px] h-[14px]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                            <span className="sr-only"> {status} </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="iframe-container"></div>
        </div>
    );
}

export default Answer;