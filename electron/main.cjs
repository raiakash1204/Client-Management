const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'DEV';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,   // safer, unless you need it
      contextIsolation: true,   // recommended
      preload: path.join(__dirname, 'preload.js') // optional — if you don't have preload.js, just remove this line
    }
  });


win.setTitle('Client Manager');

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // VERY IMPORTANT — use path.resolve
    win.loadFile(path.resolve(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
