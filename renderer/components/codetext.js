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
            {language && (
                <div className="code-language-label">{language.toUpperCase()}</div>
            )}
            <SyntaxHighlighter language={language} style={oneDark}>
                {code}
            </SyntaxHighlighter>
            <button className="code-copy-button" onClick={handleCopy}>
                {status}
            </button>
        </div>
    );
};

export default CodeText;