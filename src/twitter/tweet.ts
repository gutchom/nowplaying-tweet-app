import type { TwitterApi } from 'twitter-api-v2';
import type { MusicInfo } from '../mac/music';
import music from '../mac/music';

export default async function tweet(client: TwitterApi): Promise<MusicInfo> {
  const { title, artist, artwork, url } = await music();
  const text = `${artist} の ${title} を聴いているよ #nowplaying\n` + url ?? '';
  if (artwork) {
    const mediaIds = await client.v1.uploadMedia(artwork);
    await client.v1.tweet(text, { media_ids: mediaIds });
    return { title, artist, artwork };
  } else {
    await client.v1.tweet(text);
    return { title, artist };
  }
}
