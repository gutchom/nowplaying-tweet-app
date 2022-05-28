import axios from 'axios';
import '@jxa/global-type';
import { run } from '@jxa/run';
import type { AppleMusicApiResponse } from './AppleMusicAPI';

type TrackInfo = {
  title: string;
  artist: string;
  artwork?: string;
};

function getTrackInfo(): Promise<TrackInfo> {
  return run<TrackInfo>(() => {
    const music = Application('Music');
    const { name, artist, artworks } = music.currentTrack;
    return {
      title: name(),
      artist: artist(),
      artwork: artworks[0].rawData().slice(8, -2),
    };
  });
}

async function getAppleMusicUrl(
  title: string,
  artist: string,
): Promise<string> {
  const uri = encodeURIComponent(`${artist} ${title}`);
  const endpoint = `https://itunes.apple.com/search?term=${uri}&entity=musicTrack`;
  const { data } = await axios.get<AppleMusicApiResponse>(endpoint);
  return data ? data.results[0].trackViewUrl : '';
}

export type MusicInfo = {
  title: string;
  artist: string;
  artwork?: Buffer;
  url?: string;
};

export default async function music(): Promise<MusicInfo> {
  const { title, artist, artwork: hex } = await getTrackInfo();
  const url = await getAppleMusicUrl(title, artist);
  if (hex) {
    const artwork = Buffer.from(hex, 'hex');
    return { title, artist, artwork, url };
  } else {
    return { title, artist, url };
  }
}
