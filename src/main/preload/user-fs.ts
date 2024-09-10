import { ipcRenderer } from 'electron';

const sync = async (directoryPath: string, username: string, fbToken: string) => {
    console.log('invoke renderer with args: ', directoryPath, username, fbToken);
    return ipcRenderer.invoke('sync-music-directory', directoryPath, username, fbToken);
};

export const userFs = {
    sync,
};

export type UserFS = typeof userFs;
