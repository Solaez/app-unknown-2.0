export interface GithubRom {
  id: string;
  title: string;
  region: string;
  size: string;
  rating: number;
  year: number;
  genre: string;
  players: string;
  description: string;
  developer: string;
  downloadUrl: string;
  coverUrl: string;
  videoId: string;
  instructions: string[];
}

export interface GithubConsole {
  id: string;
  name: string;
  shortName: string;
  gradient: string;
  logoText: string;
  description: string;
  emulator: string;
  emulatorUrlWin?: string;
  emulatorExeWin?: string;
  emulatorUrlLinux?: string;
  emulatorExeLinux?: string;
  emulatorTypeLinux?: string;
  fileExtensions: string[];
  romCount: number;
  roms: GithubRom[];
}

export interface RomDataJson {
  consoles: GithubConsole[];
}

export interface FlatRom extends GithubRom {
  consoleName: string;
  consoleId: string;
  consoleGradient: string;
  consoleShortName: string;
}
