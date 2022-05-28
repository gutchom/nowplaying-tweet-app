import 'dotenv/config';
import path from 'path';
import {
  BrowserWindow,
  Notification,
  app,
  ipcMain,
  nativeImage,
} from 'electron';
import electronReload from 'electron-reload';
import { TwitterApi } from 'twitter-api-v2';
import { store } from './store';
import tweet from './twitter/tweet';

// 開発モードの場合はホットリロードする
if (process.env.NODE_ENV === 'development') {
  const execPath =
    process.platform === 'win32'
      ? '../node_modules/electron/dist/electron.exe'
      : '../node_modules/.bin/electron';

  electronReload(__dirname, {
    electron: path.resolve(__dirname, execPath),
  });
}

app.whenReady().then(async () => {
  const appKey = process.env.TWITTER_CONSUMER_KEY;
  const appSecret = process.env.TWITTER_CONSUMER_SECRET;
  if (!appKey || !appSecret) {
    throw new Error('environment variables are undefined.');
  }

  const clients = new Map<string, TwitterApi>();
  const accounts = store.get('accounts', []);
  for (const account of accounts) {
    const { userId, accessToken, accessSecret } = account;
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });
    clients.set(userId, client);
  }
  if (accounts.length === 0) {
    ipcMain.emit('login');
  }

  ipcMain.on('tweet', async (event, userId) => {
    const client = clients.get(userId);
    if (client) {
      const { title, artist, artwork } = await tweet(client);
      new Notification({
        title: '#nowplaying',
        subtitle: `${artist} / ${title}`,
        icon: artwork ? nativeImage.createFromBuffer(artwork) : undefined,
      });
    }
  });

  ipcMain.on('login', async (event) => {
    const client = new TwitterApi({ appKey, appSecret });
    const { url } = await client.generateAuthLink();
    const authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        webSecurity: false,
        preload: path.resolve(__dirname, 'preload.js'),
      },
    });

    authWindow.webContents.on('will-navigate', (event, url) => {
      if (url === 'https://api.twitter.com/oauth/authorize') {
        authWindow.webContents.executeJavaScript(
          'i=(t=document.body.innerText).search(/\\d{7}/);electronAPI.pin(t.slice(i,i+7));',
        );
      }
    });

    ipcMain.on('pin', async (event, pin: string) => {
      const {
        client: authed,
        userId,
        screenName,
        accessToken,
        accessSecret,
      } = await client.login(pin);
      const accounts = store.get('accounts', []);
      accounts.concat({ userId, screenName, accessToken, accessSecret });
      clients.set(userId, authed);
    });

    await authWindow.loadURL(url);
  });
});
