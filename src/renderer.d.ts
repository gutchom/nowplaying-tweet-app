export interface IElectronAPI {
  loadPreferences: () => Promise<void>,
  logout: () => void,
  tweet: (text: string) => void,
  setTemplate: (template: string) => void,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
