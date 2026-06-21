import { app, BrowserWindow, Menu, shell } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const indexHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');

  console.log('========================================');
  console.log('[Electron] isPackaged:', app.isPackaged);
  console.log('[Electron] __dirname:', __dirname);
  console.log('[Electron] preload:', preloadPath);
  console.log('[Electron] index.html:', indexHtmlPath);
  console.log('[Electron] isDev:', isDev);
  if (isDev) console.log('[Electron] DEV_SERVER:', DEV_SERVER_URL);
  console.log('========================================');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: '#f5f7fa',
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    },
    frame: true,
    title: '冷链质量稽核系统',
    titleBarStyle: 'default'
  });

  mainWindow.once('ready-to-show', () => {
    console.log('[Electron] ready-to-show, displaying window');
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Electron] did-finish-load');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Electron] did-fail-load:', errorCode, errorDescription);
    if (!isDev) {
      console.log('[Electron] 尝试加载本地页面:', indexHtmlPath);
      mainWindow?.loadFile(indexHtmlPath).catch(err => {
        console.error('[Electron] loadFile 也失败:', err);
      });
    }
  });

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    const prefix = level === 0 ? '[LOG]' : level === 1 ? '[WARN]' : '[ERR]';
    console.log(`[Renderer] ${prefix} ${message}`);
  });

  if (isDev) {
    console.log('[Electron] 开发模式，加载 URL:', DEV_SERVER_URL);
    mainWindow.loadURL(DEV_SERVER_URL).catch(err => {
      console.error('[Electron] loadURL 失败:', err);
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    console.log('[Electron] 生产模式，加载文件:', indexHtmlPath);
    mainWindow.loadFile(indexHtmlPath).catch(err => {
      console.error('[Electron] loadFile 失败:', err);
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '导出承运商报表',
          accelerator: 'Ctrl+E',
          click: () => {
            mainWindow?.webContents.send('export-report');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '操作',
      submenu: [
        {
          label: '刷新',
          accelerator: 'F5',
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: '强制刷新',
          accelerator: 'Ctrl+F5',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'zoomIn', label: '放大', accelerator: 'Ctrl+=' },
        { role: 'zoomOut', label: '缩小', accelerator: 'Ctrl+-' },
        { role: 'resetZoom', label: '重置缩放', accelerator: 'Ctrl+0' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏', accelerator: 'F11' },
        { role: 'toggleDevTools', label: '开发者工具', accelerator: 'F12' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于冷链质量稽核系统',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 480,
              height: 360,
              resizable: false,
              minimizable: false,
              maximizable: false,
              modal: true,
              parent: mainWindow || undefined,
              title: '关于',
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false
              }
            });

            aboutWindow.setMenu(null);
            aboutWindow.loadURL(
              'data:text/html;charset=utf-8,' +
              encodeURIComponent(`
                <html>
                  <head>
                    <title>关于</title>
                    <style>
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
                        padding: 32px;
                        margin: 0;
                        background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
                        height: 100vh;
                        box-sizing: border-box;
                        text-align: center;
                      }
                      h1 { color: #1890ff; margin-bottom: 8px; }
                      .subtitle { color: #8c8c8c; font-size: 14px; margin-bottom: 24px; }
                      .info { color: #595959; font-size: 13px; line-height: 1.8; }
                      .version { color: #262626; font-weight: 600; margin-top: 16px; }
                    </style>
                  </head>
                  <body>
                    <h1>冷链质量稽核系统</h1>
                    <p class="subtitle">Cold Chain Quality Audit System</p>
                    <div class="info">
                      <p>专为食品、医药企业质控人员设计</p>
                      <p>用于历史运单温度留痕抽查与承运商质量考核</p>
                    </div>
                    <p class="version">版本 1.0.0</p>
                    <p style="color:#8c8c8c; font-size:12px; margin-top:8px">© 2026 All Rights Reserved</p>
                  </body>
                </html>
              `)
            );
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  console.log('[Electron] app.whenReady() 触发');
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
