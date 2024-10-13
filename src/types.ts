export interface JellyfinConfig {
  server: string;
  username: string;
  password: string;
  token: string;
}

export interface Config {
  interval?: number;
  jellyfin: JellyfinConfig;
}

export interface Song {
  Name: string;
  AlbumArtist: string;
  Id: string;
}