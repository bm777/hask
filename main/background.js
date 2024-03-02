import { app, BrowserWindow, globalShortcut, Menu, ipcMain, dialog } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
let mainWindow; // Moved mainWindow to the top level
let settingsWindow;

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const _options = (title, message) => {
  return {
    type: 'info',
    buttons: ['Ok'],
    title,
    message,
  };
};

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
          block.includes('"}}]}')
      ) {
          return block;
      }
  });
  return blocks;
}

async function showDialog(title, message) {
  dialog.showMessageBox(mainWindow, _options(title, message)).then((result) => {
    console.log("============================", result);
    if (result.response === 0) {
      if (!settingsWindow || settingsWindow.isDestroyed()) {
        settingsWindow = createSettingsWindow();
      } else {
        settingsWindow.focus();
      }
    }
  });
}

function get_content_block(block) {
  let bufferData;
  try {
    const jsonData = JSON.parse('{ "data"' + block.trim().slice(4, -1) + "}}");
    bufferData = jsonData["data"]["choices"][0]["message"]["content"];
  } catch (error) {
    console.error("Error parsing JSON block:", error);
    bufferData = "Error parsing response";
  }
  return bufferData;
}

ipcMain.on("search", async (event, query, model, token, systemPrompt, temperature, maxTokens) => {
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
        {role: 'system', content: systemPrompt || 'Be precise and concise.'},
        {role: 'user', content: query}
      ],
      max_tokens: maxTokens ? parseInt(maxTokens, 10) : 500,
      temperature: temperature ? parseFloat(temperature) : 0.75,
      stream: true
    }
  };

  console.log("API Request Body:", options.data); // Log the request body

  try {
    const response = await axios.request(options);
    const stream = response.data;
    let buffer = "";

    stream.on('data', (chunk) => {
      buffer += chunk.toString('utf-8');
      let blocks = get_blocks(buffer);
      if (blocks.length > 0) {
        const answer = get_content_block(blocks[blocks.length - 1]);
        event.sender.send('search-result', answer);
        buffer = ""; // Clear the buffer after handling the message
      }
    });

    stream.on('end', () => {
      event.sender.send('search-end');
    });

    stream.on('error', (error) => {
      console.error('Error while reading the stream:', error);
      event.sender.send('search-error', 'An error occurred while processing your request.');
    });
  } catch (error) {
    console.error('Error in search API call:', error);
    event.sender.send('search-error', 'An error occurred while processing your request.');
    showDialog("The API is not valid", "Please check your API key and try again or ensure your internet connection is active.");
  }
});


app.on('ready', () => {
  globalShortcut.register('Option+X', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
});

async function createMainWindow() {
  mainWindow = createWindow('main', {
    width: 750,
    height: 480,
    alwaysOnTop: true,
    resizable: true,
    maximizable: false,
    minimizable: false,
    transparent: true,
    backgroundColor: "#00ffffff",
    frame: false
  });

  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  ipcMain.on('window-blur', () => {
    mainWindow.hide();
  });

  if (isProd) {
    await mainWindow.loadURL('app://./hask.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/hask`);
  }
  return mainWindow;
}

async function createSettingsWindow() {
  settingsWindow = createWindow('settings', {
    width: 750,
    height: 480,
    alwaysOnTop: true,
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

(async () => {
  await app.whenReady();

  mainWindow = await createMainWindow();

  globalShortcut.register('CmdOrCtrl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
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
          label: 'Open Settings',
          accelerator: 'CmdOrCtrl+,',
          click: async () => {
            if (!settingsWindow || settingsWindow.isDestroyed()) {
              settingsWindow = await createSettingsWindow();
            } else {
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
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

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