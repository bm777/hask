import React, { useEffect, useState, useRef } from 'react';
import Prism from 'prismjs';
import DOMPurify from 'dompurify';
// Ensure all necessary language definitions are imported
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
// ... other imports

const CodeText = ({ children }) => {
    const [status, setStatus] = useState('copy');
    const [language, setLanguage] = useState('');
    const [code, setCode] = useState('');
    const codeRef = useRef(null);

    useEffect(() => {
        // Regex to match code blocks and extract language and code
        const regex = /^```(\w+)[\s\S]*?\n([\s\S]+?)```$/;
        const result = regex.exec(children);
        if (result) {
            // Set the extracted language and code
            setLanguage(result[1]);
            setCode(result[2]);
        } else {
            // Default to plain text if no language is found
            setLanguage('plaintext');
            setCode(children);
        }
    }, [children]);

    useEffect(() => {
        // Ensure the language is available in Prism
        if (language && Prism.languages[language] && codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [language, code]);

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
            {language && language !== 'plaintext' && (
                <div className="code-language-label">{language.toUpperCase()}</div>
            )}
            <pre className={`language-${language}`} ref={codeRef}>
                <code
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            Prism.highlight(code, Prism.languages[language] || Prism.languages.plaintext, language)
                        ),
                    }}
                />
            </pre>
            <button className="code-copy-button" onClick={handleCopy}>
                {status}
            </button>
        </div>
    );
};

export default CodeText;