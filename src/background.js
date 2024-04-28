import extractPageText from './content-script.js';

let url;
let title;
// check if history is indexed, and start indexing if not -> 1 weeks
chrome.runtime.onInstalled.addListener(async (details) => {

    if (details.reason === 'install') {
        console.log('This is a first install!');
        // check if the history is indexed
        let response = await fetch('http://localhost:1777/check/history', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });
        let data = await response.json();
        if (data.status === "not indexed") {
            console.log("History not indexed, start indexing");
            // implementation in v2
        }
    }
});

// listen for connections from the content script
chrome.runtime.onConnect.addListener((port) => {
    // add listenerfor the onDisconnect event
    port.onDisconnect.addListener(() => {
        console.log('Port disconnected');
    });
});



chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
        if (changeInfo.status === 'complete' && tab.url.startsWith('http') ) {
            url = tab.url;
            title = tab.title;
            console.log("url ->", url);
            console.log("title ->", title);
    
            // check if the url is already in the database
            let response = await fetch('http://localhost:1777/check/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ url: url })
            });
            let data = await response.json();
            if (data.status === "not exists") {
                console.log("url not exists in the database");
                // extract the text from the page
                chrome.scripting.executeScript({
                    target: { tabId },
                    function: extractPageText
                }); 
            } else {
                console.log("url exists in the database, then skip it");
                // or maybe also count the number of skips
                // for later analysis
            }
        }
    } catch (error) {
        console.error(error);
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'savePageData') {
        const { data } = request;
        // console.log('Page data received:', data); // redy to process
        // ingesting the data
        //// - url
        //// - title
        //// - content
        const obj = {
            url: url,
            title: title,
            content: data.content
        };

        try {
            const response = await fetch('http://localhost:1777/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.log("/ingest endpoint not ready:", error)
        }
    }
  });