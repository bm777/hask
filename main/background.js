import { app, globalShortcut, Menu, ipcMain, dialog } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from 'axios';

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
    title: title,
    message: message,
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
      ) return block;
  });
  return blocks;
}

async function showDialog(title, message) {
  dialog.showMessageBox(mainWindow, _options(title, message)).then((result) => {
    console.log("============================", result);
    if (result.response === 0) {
      // open settings window
      if (!settingsWindow || settingsWindow.isDestroyed()) {
        settingsWindow = createSettingsWindow();
      } else {
        settingsWindow.focus();
      }
    }
  });
}
async function createMainWindow() {
  const mainWindow = createWindow('21éeé', {
    width: 750,
    height: 480,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    transparent: true,
    backgroundColor: "#00ffffff", //'#fa2E292F',
    frame: false
  });

  mainWindow.on('blur', (e) => {
    mainWindow.hide();
  });
  ipcMain.on('window-blur', (e) => {
    mainWindow.hide();
  });

  function get_content_block(block) {
    try {
        const jsonData = JSON.parse('{ "data"' + block.trim().slice(4, -1) + "}}");
        bufferData = jsonData["data"]["choices"][0]["message"]["content"];
        return bufferData;
    } catch (error) {
        console.log("Error happened: Skipped and will catch up with the next block.");
    }
    console.log("||||||||||||||||||||||||||||||||||||||||||||||", bufferData);
    return bufferData;
}

  ipcMain.on("search", async (event, query, model, token) => {
    const auth = 'Bearer ' + token
    const options = {
      method: 'POST',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: auth
      },
      responseType: 'stream',
      data: {
        model: 'mistral-7b-instruct',
        messages: [
          {role: 'system', content: 'Be precise and concise.'},
          {role: 'user', content: query}
          // {role: 'user', content: 'explain me how to use useeffect in nextjs'}
        ],
        stream: true
      }
    };
    let bufferData = '';
    function get_content_block(block) {
      try {
          const jsonData = JSON.parse('{ "data"' + block.trim().slice(4, -1) + "}}");
          bufferData = jsonData["data"]["choices"][0]["message"]["content"];
          return bufferData;
      } catch (error) {
          // console.log("Error happened: Skipped and will catch up with the next block.");
      }
      console.log("||||||||||||||||||||||||||||||||||||||||||||||", bufferData);
      return bufferData;
    }
    
    try {
      const response = await axios.request(options)
      const stream = response.data;
      let buffer = '';
  
      stream.on('data', (chunk) => {
        // Convert the chunk to a string and remove leading/trailing/whitespace
        let read_data = chunk.toString('utf-8'); 
        let last_8_char = read_data.slice(-8).trim();
        let top_12_char = read_data.slice(0, 12).trim();

        // itt might contains more than 0 blocks
        let blocks = get_blocks(read_data); 
        let block_size = blocks.length;

        if (last_8_char === "}}]}" && block_size === 1 && top_12_char === 'data: {"id":') {
          const answer = get_content_block(blocks[0]);
          event.sender.send('search-result', answer);
          buffer = ""

        } else { // this else stands for the case when the data is not complete

          if (block_size >= 1) { 
            const answer = get_content_block(blocks[blocks.length - 1]);
            event.sender.send('search-result', answer);
          }
          buffer += read_data; // no need anymore
        }
      });

      stream.on('end', () => {
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
  return mainWindow;
}

async function createSettingsWindow() {
  settingsWindow = createWindow('2er', {
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

  const mainWindow = await createMainWindow();

  const isMac = process.platform === 'darwin'
  
  const template = [
    {
      label: 'Hask AI',
      submenu: [
        isMac ? { role: 'quit' } : { role: 'quit' }
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
              const settings = await createSettingsWindow();
              settings.toggleDevTools();
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

  // keeping the app on top of a fullscreen app
  mainWindow.setAlwaysOnTop(true, "floating", 1);
  mainWindow.setVisibleOnAllWorkspaces(true);
  // mainWindow.setFullScreenable(true);
  app.dock.hide();


  app.on('window-all-closed', (e) => {
    app.quit()
    e.preventDefault()
  });
  
})();



