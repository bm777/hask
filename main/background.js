import { app, globalShortcut, Menu, ipcMain, dialog } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';

const isProd = process.env.NODE_ENV === 'production';
let settingsWindow;

if (isProd) {
  serve({ directory: 'app' }); // important for the build
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const options = (title, message) => {
  return {
    type: 'info',
    title: title,
    message: message,
    buttons: ['Ok']
  }
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

  ipcMain.on('warning', (e, title, message) => {
    // open the dialog and check if the user has clicked the ok button
    dialog.showMessageBox(mainWindow, options(title, message)).then((result) => {
      console.log(result);
      if (result.response === 0) {
        // open settings window
        if (!settingsWindow || settingsWindow.isDestroyed()) {
          createSettingsWindow();
        } else {
          settingsWindow.focus();
        }
      }
    }
    );
  })

  globalShortcut.register('Option+X', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  })

  // --------> mainWindow.toggleDevTools();
  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.setVisibleOnAllWorkspaces(true);
  // mainWindow.setFullScreenable(false);

  if (isProd) {
    await mainWindow.loadURL('app://./hask.html');
    // console.log("in production")
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/hask`);
  }
  return mainWindow;
}

async function createSettingsWindow() {
  console.log("creating settings window");
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
              await createSettingsWindow();
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
  app.dock.hide();


  app.on('window-all-closed', (e) => {
    app.quit()
    e.preventDefault()
  });
  
})();



