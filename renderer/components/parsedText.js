import React from 'react';

const ParsedText = ({ text }) => {
  return (
    <div
      className="markdown-body text-sm"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

export default ParsedText;