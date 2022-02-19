
//
// main.js is an electron wrapper around game.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// https://www.electronjs.org/docs/tutorial/quick-start

// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path');
const fs = require('fs');
const settings = require('electron-settings');


let game_fullscreen = false;


function createWindow () {
  // Create the browser window.

  settings.get('fullscreen.data').then(value => {

    let fullscreen = false;
    if (value != null) fullscreen = value;

    const mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      fullscreen: fullscreen,
      useContentSize: true,
      backgroundColor: '#000000',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        enableRemoteModule: true,
        contextIsolation: false,
      }
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    ipcMain.on('synchronous-message', (event, arg) => {
      if (arg[0] == "fullscreen" && arg[1] == true) {
        mainWindow.setFullScreenable(true);
        mainWindow.setFullScreen(true);
        mainWindow.maximize();
        mainWindow.show();
        settings.set('fullscreen', {
            data: true
        });
        event.returnValue = 'game is full screen.'
      } else if (arg[0] == "fullscreen" && arg[1] == false) {
        mainWindow.setFullScreen(false);
        mainWindow.unmaximize();
        mainWindow.setSize(1440, 922);
        mainWindow.show();
        settings.set('fullscreen', {
            data: false
        });
        event.returnValue = 'game is windowed.'
      } else if (arg[0] == "get_fullscreen") {
        event.returnValue = mainWindow.isFullScreen();
      } else if (arg[0] == "save_map") {
        console.log("saving");
        let map_name = arg[1];
        let map_data = arg[2];

        let filename = "./Maps/" + map_name + "/map.json";
        let content = JSON.stringify(map_data, null, " ");

        fs.writeFile(filename, content, (err) => {
            if(err){
              console.log("Map saving at " + filename + " errored: "+ err.message)
              event.returnValue = false;
            }
                        
            console.log("Map saved to " + filename);
            event.returnValue = true;
        });
        console.log("okay, okay, okay");
      }
    });
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
})

