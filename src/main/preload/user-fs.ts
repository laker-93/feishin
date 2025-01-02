import { ipcRenderer } from 'electron';

const sync = async (directoryPath: string, username: string, fbToken: string) => {
    console.log('invoke renderer with args: ', directoryPath, username, fbToken);
    return ipcRenderer.invoke('sync-music-directory', directoryPath, username, fbToken);
};

const upload = async (files: string[], fbToken: string) => {
    return ipcRenderer.invoke('upload-files', files, fbToken);
};

const getAppPath = async () => {
    return ipcRenderer.invoke('get-app-path');
};

const downloadRBXML = async (fbToken: string) => {
    return ipcRenderer.invoke('download-rb-xml', fbToken);
};

const downloadSeratoCrates = async (fbToken: string) => {
    return ipcRenderer.invoke('download-serato-crates', fbToken);
};
export const userFs = {
    downloadRBXML,
    downloadSeratoCrates,
    getAppPath,
    sync,
    upload,
};

export type UserFS = typeof userFs;
