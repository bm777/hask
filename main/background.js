import { app, globalShortcut, Menu, ipcMain, dialog, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from 'axios';
const Groq = require('groq-sdk');

const isProd = process.env.NODE_ENV === 'production';
let settingsWindow;

if (isProd) {
  serve({ directory: 'app' }); // important for the build
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
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
      if (    block.includes('"id"') && 
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
    resizable: false,
    maximizable: false,
    minimizable: false,
    frame: true
  });

  if (isProd) {
    await settingsWindow.loadURL('app://./settings.html');
  } else {
    const port = process.argv[2];
    await settingsWindow.loadURL(`http://localhost:${port}/settings`);
  }
  return settingsWindow;
}
async function createMainWindow() {
  const mainWindow = createWindow('main-window', {
    width: 750,
    height: 480,
    // alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    transparent: true,
    backgroundColor: "#00ffffff", //'#fa2E292F',
    frame: false
  });

  mainWindow.on('blur', (e) => {
    // mainWindow.hide();
  });
  ipcMain.on('window-blur', (e) => {
    // mainWindow.hide();
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
  ipcMain.on("search-pplx", async (event, query, model, token, systemPrompt, temperature, maxTokens) => {
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
        model: model,
        messages: [
          {role: 'system', content: systemPrompt ? systemPrompt : 'Be precise and concise.'},
          {role: 'user', content: query}
          // {role: 'user', content: 'explain me how to use useeffect in nextjs'}
        ],
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 500,
        temperature: temperature ? parseFloat(temperature) : 0.75,
        stream: true
      }
    };
    let bufferData = '';
    
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
          console.log('search time', tokens, time, (tokens/time))
          event.sender.send('search-time', (tokens/time).toFixed(0), time);
          event.sender.send('search-end');
      });

      stream.on('error', error => {
        console.error('Error while reading the stream:', error);
    });
  
    } catch( error ) {
        console.log(error)
        dialog.showMessageBox(mainWindow, _options("The API is not valid", "Please check your API key and try again or your internet doesn't work.")).then(async (result) => {
          
          if (result.response === 0) {
            if (!settingsWindow || settingsWindow.isDestroyed()) {
              settingsWindow = await createSettingsWindow();
            } else {
              settingsWindow.focus();
            }
          }
        });
      }
  })
  ipcMain.on("search-groq", async (event, query, model, token, systemPrompt, temperature, maxTokens) => {
    const groq = new Groq({apiKey: token});
    console.log('search-groq', query, model, token, systemPrompt, temperature, maxTokens)
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": query
        }
      ],
      "model": model,
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
        console.log("search time", tokens, time, (tokens/time).toFixed(0))
        event.sender.send('search-time', (tokens/time).toFixed(0), (time * 1000).toFixed(0));
        event.sender.send('search-end');
        break
      }
      event.sender.send('search-result', bufferData);
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
  // mainWindow.toggleDevTools();
  // 

  if (isProd) {
    await mainWindow.loadURL('app://./hask.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/hask`);
  }

  mainWindow.setAlwaysOnTop(true, "normal");
  // mainWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  // mainWindow.setFullScreenable(false);
  return mainWindow;
}


(async () => {
  await app.whenReady();

  const mainWindow = await createMainWindow();

  
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
              // settingsWindow.toggleDevTools();
            } else {
                // If the settings window is already open, bring it to focus
                settingsWindow.focus();
            }
            // settingsWindow.toggleDevTools()
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

})();
