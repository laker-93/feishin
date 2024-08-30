import { ipcRenderer } from 'electron';

const authenticate = async (username: string, password: string) => {
    return ipcRenderer.invoke('fb-authenticate', username, password);
};

const sync = async (directoryPath: string, username: string, fbToken: string) => {
    console.log('invoke renderer with args: ', directoryPath, username, fbToken);
    return ipcRenderer.invoke('sync-music-directory', directoryPath, username, fbToken);
};

export const userFs = {
    authenticate,
    sync,
};

export type UserFS = typeof userFs;
