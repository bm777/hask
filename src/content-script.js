export default function extractPageData() {
    const pageData = {
      content: document.body.innerText
    };
    console.log('Page data extracted:', pageData);
    chrome.runtime.sendMessage({ action: 'savePageData', data: pageData }, (response) => {
      console.log('Page data saved successfully:', response.success);
    });
  }
  