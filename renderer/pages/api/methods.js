import axios from 'axios';
import { processStreamableRequest } from "./ollamaPuller";

export async function searchPPLXlegacy(query, token, model) {
    const auth = 'Bearer ' +token
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'text/event-stream',
            authorization: auth
        },
        body: JSON.stringify({
            model: model ? model : 'pplx-7b-online',
            messages: [{role: 'system', content: 'Be consistent with your answers.'}, {role: 'user', content: query}],
            stream: true
        })
    }

    try {
        console.log(options);
        const response = await fetch('https://api.perplexity.ai/chat/completions', options);
        const json = await response.json();
        console.log(json);
        let choices
        if(json["choices"]) {
            choices = json["choices"][0]
            return {choices: choices["message"]["content"]};
        }
        return {error: "No choices found"};
    } catch (error) {
        console.error("Error in searchPPLX", error.message);
        return {error: error};
    }
}

export const optionsConstructor = (url, key, model, query) => {
    const auth = 'Bearer ' + key
    return {
        method: "POST",
        url: url,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: auth
        },
        data: {
          model: model,
          messages: [
            {role: 'system', content: 'Be precise and concise.'},
            {role: 'user', content: query}
          ],
          stream: true
        },
        responseType: 'stream',
      };
}

export const parseLink = (line) => {
    // const urlRegex = /(https?:\/\/[^\s]+)/g;
    // return line.replace(urlRegex, '<a href="$1" target="_blank" className="text-blue-600">$1</a>');
    return line
};
export function store(provdider, models) {
    try {
        const data = JSON.stringify(models);
        localStorage.setItem(provdider, data);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export function retrieve(provider) {
    try {
        const data = localStorage.getItem(provider);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export function get_code_blocks(lines){
    let insideCodeBlock = false;
    let linesWithCodeBlocks = [];

    for (const line of lines) {

        if (line.startsWith("```")) {
            if (!insideCodeBlock) {
                insideCodeBlock = true;
                linesWithCodeBlocks.push(line);
            } else {
                insideCodeBlock = false;
                linesWithCodeBlocks[linesWithCodeBlocks.length - 1] += "\n" + line; // Append the line to the last element in the array
            }
        } else {
            if (insideCodeBlock) {
                linesWithCodeBlocks[linesWithCodeBlocks.length - 1] += "\n" + line;
            } else {
                linesWithCodeBlocks.push(line);
            }
        }
    }
    return linesWithCodeBlocks;
}

// get backtick code blocks
export function get_backtick_block(lines){
    let insideCodeBlock = false;
    let linesWithCodeBlocks = [];

    for (const line of lines) {

        if (line.startsWith("`")) {
            if (!insideCodeBlock) {
                insideCodeBlock = true;
                linesWithCodeBlocks.push(line);
            } else {
                insideCodeBlock = false;
                linesWithCodeBlocks[linesWithCodeBlocks.length - 1] += "\n" + line; // Append the line to the last element in the array
            }
        } else {
            if (insideCodeBlock) {
                linesWithCodeBlocks[linesWithCodeBlocks.length - 1] += "\n" + line;
            } else {
                linesWithCodeBlocks.push(line);
            }
        }
    }
    return linesWithCodeBlocks;
}
export const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function joinValue(obj) {

    let result = '';
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                result += value + ' ';
            }
        }
    }
    return result.trim();
}

async function isUrlRunning(url) {
    try {
      const response = await axios.get(url);
      return response.status === 200;
    } catch (error) { return false }
}

export async function getOllamaTags(withTag = false) {

    const isOllamaRunning = await isUrlRunning('http://localhost:11434');
    if (!isOllamaRunning) {
        window.ipc.send("logger", `ollama is not running${isOllamaRunning}`)
        return ["loading..."];
    }
    else {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        const models = data.models;
        let modelNames = [];
        for (let i = 0; i < models.length; i++) {
            if (withTag) {
                modelNames.push({model: models[i].name, digest: models[i].digest});
            } else {
                modelNames.push(models[i].name.split(':')[0]);
            }
        }
        return modelNames;
    }
}

async function jsonhash(json) {
    const jsonstring = JSON.stringify(json).replace(/\s+/g, '')
    const messageBuffer = new TextEncoder().encode(jsonstring);
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  
}

export async function isLatest(model, localdisgest) {
    let [repo, tag] = model.split(":")
    if (!repo.includes("/")) { repo = `library/${repo}` }

    const remoteModelInfo = await fetch(`https://ollama.ai/v2/${repo}/manifests/${tag}`, {
        headers: { "Accept": "application/vnd.docker.distribution.manifest.v2+json" }
    })
    if(remoteModelInfo.status === 200) {
        const _json = await remoteModelInfo.json()
        const hash = await jsonhash(_json);
        return hash === localdisgest
    }
    return false
}

export async function pullOllamaModel(request) {
    return processStreamableRequest('pull', {
        name: request.model,
        stream: request.stream,
        insecure: request.insecure,
        username: request.username,
        password: request.password,
    });
}
export async function generateOllama(request) {
    return processStreamableRequest('generate', request);
  }