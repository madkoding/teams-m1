const { app, shell, session, BrowserWindow, Menu, } = require('electron')
const path = require('path')

const config = {
  useContentSize: true,
  width: 1281,
  height: 800,
  center: true,
  // backgroundColor: '#fff',
  title: 'Microsoft Teams M1',
  icon: path.resolve(__dirname, 'assets/icons/png/256x256.png'),
  show: true,
  autoHideMenuBar: true,
  webPreferences: {
    devTools: true,
    // webSecurity: true,
    // nodeIntegration: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true,
    plugins: true,
    preload: path.resolve(__dirname, 'src/preload.js'),
    sandbox: false,
  },
}

app.on('ready', function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(require('./src/menu')))

  session.defaultSession.clearStorageData(null, () => {
    // in our case we need to restart the application
    app.relaunch()
    app.exit()
  })

  let mainWindow = new BrowserWindow(config)
  mainWindow.setTitle(require('./package.json').description)

  mainWindow.on('reload', () => {
    session.defaultSession.clearStorageData(null, () => {
      // in our case we need to restart the application
      app.relaunch()
      app.exit()
    })
  })

  mainWindow.on('close', function (e) {
    const choice = require('electron').dialog.showMessageBoxSync(this,
      {
        type: 'question',
        buttons: [ 'Yes', 'No', ],
        title: 'Confirm',
        message: 'Are you sure you want to quit?',
      })
    if (choice === 1) {
      e.preventDefault()
    }
  })

  mainWindow.loadURL('https://teams.microsoft.com', {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
  })

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.show()
})
