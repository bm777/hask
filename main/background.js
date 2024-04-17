import { app, globalShortcut, BrowserWindow, Menu, ipcMain, dialog, shell, Tray, nativeImage } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from 'axios';
import path from 'path';
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const Groq = require('groq-sdk');
const OpenAI = require('openai').OpenAI
const Anthopic = require('@anthropic-ai/sdk');
const CohereClient = require('cohere-ai').CohereClient

const isProd = process.env.NODE_ENV === 'production';
const postInstallFlagPath = path.join(app.getPath('userData'), 'postInstallDone.flag');
let settingsWindow;
let mainWindow;
let pingOllamaSender;

if (isProd) {
  serve({ directory: 'app' }); // important for the build
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}
let tray = null;
function getParentDir(_file) {
  if (isProd) return path.dirname(path.dirname(path.dirname(__dirname)))
  else return path.dirname(__dirname)
}
function resolveHome(filepath) {
  return filepath.startsWith('~') ? path.join(os.homedir(), filepath.slice(1)) : filepath;
}
const _options = (title, message) => {
  return {
    type: 'info',
    title,
    message,
    buttons: ['Ok']
  }
}
function get_blocks(data) {
  let blocks = data.split('\r\n');
  blocks = blocks.filter(block => {
    if (block.includes('"id"') &&
      block.includes('"created"') &&
      block.includes('"prompt_tokens"') &&
      block.includes('"total_tokens"') &&
      block.includes('"object"') &&
      block.includes('"index"') &&
      block.includes('"choices"') &&
      block.includes('"message"') &&
      block.includes('"content"') &&
      block.includes('"delta"') &&
      block.includes('"}}]}') // no need to control also the start of the block, because of the split.
    ) {
      return block;
    }
  });
  return blocks;
}
async function isUrlRunning(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) { return false }
}
async function showDialog(title, message) {
  dialog.showMessageBox(mainWindow, _options(title, message)).then((result) => {
    if (result.response === 0) {
      if (!settingsWindow || settingsWindow.isDestroyed()) {
        settingsWindow = createSettingsWindow();
      } else {
        settingsWindow.focus();
      }
    }
  });
}
async function createSettingsWindow() {
  settingsWindow = createWindow('settings-window', {
    width: 750,
    height: 480,
    resizable: true,
    maximizable: false,
    minimizable: false,
    // backgroundColor: "#19171B", //"#fa2E292F",
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isProd) {
    await settingsWindow.loadURL('app://./settings.html');
  } else {
    const port = process.argv[2];
    await settingsWindow.loadURL(`http://localhost:${port}/settings`);
  }
  settingsWindow.toggleDevTools();
  return settingsWindow;
}
async function createMainWindow() {
  mainWindow = createWindow('main-window', {
    width: 750,
    height: 480,
    // alwaysOnTop: true,
    resizable: true,
    maximizable: false,
    minimizable: false,
    transparent: true,
    backgroundColor: "#00ffffff", //'#fa2E292F',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.on('blur', (e) => {
    mainWindow.hide();
  });
  ipcMain.on('window-blur', (e) => {
    mainWindow.hide();
  });

  function get_content_block(block) {
    let bufferData = '';
    let token
    try {
      const jsonData = JSON.parse('{ "data"' + block.trim().slice(4, -1) + "}}");
      bufferData = jsonData["data"]["choices"][0]["message"]["content"];
      token = jsonData["data"]["usage"]["completion_tokens"];
    } catch (error) {
      bufferData = "Error parsing response";
    }
    return [bufferData, token];
  }
  ipcMain.on("open-url", async (event, url) => {
    shell.openExternal(url);
  })
  ipcMain.on("quit-app", async (event) => {
    app.quit();
  })
  ipcMain.on("open-settings", async (event) => {
    if (!settingsWindow || settingsWindow.isDestroyed()) {
      settingsWindow = await createSettingsWindow();
    } else {
      settingsWindow.focus();
    }
  })
  ipcMain.on("logger", (event, object) => {
    console.log('logger ->', object)
  })
  ipcMain.on("search-pplx", async (event, args) => {
    event.sender.send('search-result', " ");
    const { query, model, token, systemPrompt, temperature, maxTokens } = args
    const options = {
      method: 'POST',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },
      responseType: 'stream',
      data: {
        model: model ? model : 'pplx-7b-online',
        messages: [
          { role: 'system', content: systemPrompt ? systemPrompt : 'Be precise and concise.' },
          { role: 'user', content: query }
          // {role: 'user', content: 'explain me how to use useeffect in nextjs'}
        ],
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 500,
        temperature: temperature ? parseFloat(temperature) : 0.75,
        stream: true
      }
    };
    let bufferData = ''; //

    try {
      const response = await axios.request(options)
      const start = Date.now();
      const stream = response.data;
      let buffer = '';
      let tokens

      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf-8');
        let blocks = get_blocks(buffer);
        if (blocks.length > 0) {
          const result = get_content_block(blocks[blocks.length - 1])
          tokens = result[1]
          event.sender.send('search-result', result[0]);
          buffer = ""; // Clear the buffer after handling the message
        }
      });

      stream.on('end', () => {
        const end = Date.now();
        const time = end - start;
        console.log('search time', tokens, time, (tokens / time))
        event.sender.send('search-time', (tokens / time).toFixed(0), time);
        event.sender.send('search-end');
      });

      stream.on('error', error => {
        console.error('Error while reading the stream:', error);
      });

    } catch (error) {
      console.log("------", error)
      showDialog("The API KEY is not valid", "Please check your API key and try again or your internet doesn't work.")
    }
  })
  ipcMain.on("search-groq", async (event, args) => {
    event.sender.send('search-result', " ");
    const { query, model, token, systemPrompt, temperature, maxTokens } = args
    console.log('search-groq', query, model, token, systemPrompt, temperature, maxTokens)
    const groq = new Groq({ apiKey: token });

    try {
      const chatCompletion = await groq.chat.completions.create({
        "messages": [
          {
            "role": "user",
            "content": query
          }
        ],
        "model": model ? model : "mixtral-8x7b-32768",
        "temperature": temperature ? parseFloat(temperature) : 0.5,
        "max_tokens": maxTokens ? parseInt(maxTokens, 10) : 1024,
        "top_p": 1,
        "stream": true,
        "stop": null
      });
      let bufferData = '';
      let tps = 0;
      let tokens
      let time
      for await (const chunk of chatCompletion) {
        bufferData += chunk.choices[0]?.delta?.content || '';
        if (chunk.x_groq?.usage?.total_tokens && chunk.x_groq?.usage?.total_time) {
          tokens = chunk.x_groq?.usage?.total_tokens
          time = chunk.x_groq?.usage?.total_time
          console.log("search time", tokens, time, (tokens / time).toFixed(0))
          event.sender.send('search-time', (tokens / time).toFixed(0), (time * 1000).toFixed(0));
          event.sender.send('search-end');
          break
        }
        event.sender.send('search-result', bufferData);
      }
    } catch (error) {
      console.log("------", error)
      showDialog("The API KEY is not valid", "Please check your API key and try again or your internet doesn't work.")
    }

  })
  ipcMain.on("search-openai", async (event, args) => {
    event.sender.send('search-result', " ");
    const { query, model, token, systemPrompt, temperature, maxTokens } = args
    console.log('search-openai', query, model, token, systemPrompt, temperature, maxTokens)
    const openai = new OpenAI({ "apiKey": token });
    try {
      // const completion = await openai.complete({
      //   prompt: query,
      // });
      const completion = await openai.chat.completions.create({
        model: model ? model : 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: systemPrompt ? systemPrompt : 'You are a helpful assistant. Please respond directly; niceties and pro forma intros/conclusions are not necessary. Focus on substance and accuracy. Take your time; the user would always prefer rigour over speed.' }, { role: 'user', content: query }],
        stream: true,
        temperature: temperature ? parseFloat(temperature) : 0.5,
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 1024,
      });

      let bufferData = '';
      for await (const chunk of completion) {
        if (chunk.choices[0].delta?.content) {
          bufferData += chunk.choices[0].delta.content
          event.sender.send('search-result', bufferData);
        }
        if (chunk.choices[0].finish_reason === "stop") {
          event.sender.send('search-end');
          console.log('search-result', chunk.choices[0])
          break
        }

      }
      console.log('search-end')
    } catch (error) {
      console.log("------", error)
      showDialog("The API KEY is not valid", "Please check your API key and try again or your internet doesn't work.")
    }

  })
  ipcMain.on("search-anthropic", async (event, args) => {
    event.sender.send('search-result', " ");
    const { query, model, token, systemPrompt, temperature, maxTokens } = args
    console.log(args)
    const anthropic = new Anthopic({ apiKey: token });

    try {
      const stream = await anthropic.messages.stream({
        model: model ? model : 'claude-2.1',
        messages: [{ role: 'user', content: query }],
        temperature: temperature ? parseFloat(temperature) : 1,
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 1024,
      });

      let bufferData = '';
      stream.on("text", (text) => {
        bufferData += text;
        console.log('search-result', bufferData)
        event.sender.send('search-result', bufferData);
      });

      stream.on("end", () => {
        event.sender.send('search-end');
      });

    } catch (error) {
      console.log("------", error)
      showDialog("The API KEY is not valid", "Please check your API key and try again or your internet doesn't work.")
    }
  })
  ipcMain.on("search-cohere", async (event, args) => {
    event.sender.send('search-result', " ");
    const { query, model, token, systemPrompt, temperature, maxTokens } = args
    console.log(args)
    const cohere = new CohereClient({ token: token });

    try {
      const stream = await cohere.chatStream({
        preamble: systemPrompt ? systemPrompt : 'Be precise and concise.',
        model: model ? model : 'command',
        message: query,
        stream: true,
        temperature: temperature ? parseFloat(temperature) : 0.2,
        connectors: [{ id: "web-search" }],
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 1024
      });

      let bufferData = '';
      for await (const message of stream) {
        if (message.eventType === "text-generation") {
          bufferData += message.text;
          event.sender.send('search-result', bufferData);
        }
        if (message.eventType === "stream-end") {
          event.sender.send('search-end');
        }
      }
    } catch (error) {
      console.log("------", error)
      showDialog("The API KEY is not valid", "Please check your API key and try again or your internet doesn't work.")
    }
  })



  ipcMain.on('warning', async (e, title, message) => {
    await showDialog(title, message);
  })

  globalShortcut.register('Option+X', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  })

  ///////////////////////////////
  // --------> 
  mainWindow.toggleDevTools();
  // 

  if (isProd) {
    await mainWindow.loadURL('app://./hask.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/hask`);
  }

  const contextMenuTemplate = [
    {
      label: 'Copy',
      click: () => {
        mainWindow.webContents.send('context-menu-command', 'copy');
      }
    },
    {
      label: 'Save',
      click: () => {
        mainWindow.webContents.send('context-menu-command', 'save');
      }
    },
    // Add more menu items as needed
  ];
  
  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
  
  mainWindow.webContents.on('context-menu', (event, params) => {
    event.preventDefault();
    contextMenu.popup(mainWindow, params.x, params.y);
  });
  
  mainWindow.setAlwaysOnTop(true, "normal");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setFullScreenable(false);
  return mainWindow;
}
async function closeProcesses() {
  const scriptPath = resolveHome('~/.hask/close_process.sh');
  exec(`sh ${scriptPath} > /dev/null 2>&1`, (error, stdout, stderr) => {
    if (error) {
      console.error(`ERROR: Error closing processes: ${error}`);
      return;
    }
  });
  // close every window
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.removeAllListeners('close');
    window.close();
  });
  app.quit()
}

(async () => {
  await app.whenReady();
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
  const img = nativeImage.createFromPath(path.join(getParentDir(), isProd ? 'Resources/top_bar/hsk-16.png' : 'resources/top_bar/hsk-16.png')) // { size: { width: 16, height: 16 } }
  tray = new Tray(img);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Hask', type: "normal", accelerator: 'Option+X', click: async () => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'How to use', type: "normal", click: async () => {
        shell.openExternal('https://hask.ai');
      }
    },
    { type: 'separator' },
    {
      label: 'Join our Discord community', type: 'normal', click: async () => {
        shell.openExternal('https://discord.gg/cSf3RpQdws');
      }
    },
    {
      label: 'Support us', type: 'normal', click: async () => {
        shell.openExternal('https://git.new/hask');
      }
    },
    { type: 'separator' },
    {
      label: 'Settings', type: 'normal', click: async () => {
        if (!settingsWindow || settingsWindow.isDestroyed()) {
          settingsWindow = await createSettingsWindow();
        } else { settingsWindow.focus(); }
      }, accelerator: 'Command+,'
    },
    {
      label: 'Quit', type: 'normal', click: async () => {
        const windows = BrowserWindow.getAllWindows();
        windows.forEach((window) => {
          window.removeAllListeners('close');
          window.close();
        });
        app.quit();
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip('Hask AI')

  if (!fs.existsSync(postInstallFlagPath)) {

    settingsWindow = await createSettingsWindow();

    const scriptPath = path.join(getParentDir(), 'scripts/init.sh');
    exec(`sh ${scriptPath} > ~/hask.log 2>&1`, (error, stdout, stderr) => {
      if (error) { console.log(error); return; }
    });

    ipcMain.on('ollama-ready', () => {
      fs.writeFileSync(postInstallFlagPath, 'done');
    })
    ipcMain.on('ping-ollama', async (event) => {
      console.log('[settings]-logger -> None')
      pingOllamaSender = event.sender;
      const intervalId = setInterval(async () => {
        if (pingOllamaSender && !pingOllamaSender.isDestroyed()) {
          const isOllamaRunning = await isUrlRunning('http://localhost:11434');
          if (isOllamaRunning) {
            pingOllamaSender.send("ollama-reply", "ollama-ready");
          } else { pingOllamaSender.send("ollama-reply", "installing-ollama"); }
        } else { clearInterval(intervalId); }
      }, 500);

      event.sender.on('destroyed', () => {
        clearInterval(intervalId);
      });
    })
    ipcMain.on("logger", (event, object) => {
      console.log("[settings]-logger ->", object)
    })

  } else {
    mainWindow = await createMainWindow();
    const scriptPath = resolveHome('~/.hask/ollama.sh');
    exec(`sh ${scriptPath} > ~/hask.log 2>&1`, (error, stdout, stderr) => {
      if (error) { console.log(error); return; }
    });
  }

  ipcMain.on('relaunch-hask', async (event) => {
    // Quit the app and relaunch it
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }

    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
    app.exit(0);

    // The lines below will never be executed because app.exit(0) stops the process.
    // You should remove them or reconsider the app relaunch logic.
    // mainWindow = await createMainWindow();
    // settingsWindow = await createSettingsWindow();
    // settingsWindow.show();
  });

  const template = [
    {
      label: 'Hask AI',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Open Seettings',
          accelerator: 'CmdOrCtrl+,',
          click: async () => {
            if (!settingsWindow || settingsWindow.isDestroyed()) {
              settingsWindow = await createSettingsWindow();
            } else {
              // If the settings window is already open, bring it to focus
              settingsWindow.focus();
            }
          }
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/bm777/hask')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  app.dock.hide();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow();
    }
  });
  app.on('before-quit', closeProcesses);

})();
