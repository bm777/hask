import React, { useEffect, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Import only the necessary language syntax
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
// ... import other languages you need

// Register the language syntax
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
// ... register other languages you need

const CodeText = ({ children, language }) => {
    const [status, setStatus] = useState('copy');
    const [code, setCode] = useState('');

    useEffect(() => {
        // Remove the leading and trailing backticks and any leading/trailing newlines
        const cleanedCode = children.replace(/^```.*\n|\n```$/g, '');
        setCode(cleanedCode);
    }, [children]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(
            () => {
                setStatus('copied');
                setTimeout(() => setStatus('copy'), 2000);
            },
            () => {
                setStatus('error');
                setTimeout(() => setStatus('copy'), 2000);
            }
        );
    };

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                {language && (
                    <div className="code-language-label">{language.toUpperCase()}</div>
                )}
                <button className="code-copy-button" onClick={handleCopy}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                </button>
            </div>
            <SyntaxHighlighter language={language} style={oneDark}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeText;
