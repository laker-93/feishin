import { Readable } from 'stream';
import { fbApiClient } from './filebrowser-api';

type DownloadQuery = {
    filename: string;
};
type DownloadArgs = { query: DownloadQuery };

type UploadQuery = {
    filename: string;
};
type AddToPlaylistBody = {
    fileBytes: ArrayBuffer;
};
type UploadArgs = {
    body: AddToPlaylistBody;
    query: UploadQuery;
};

type DownloadResponse = { data: Readable };

const authenticate = async (
    url: string,
    body: { password: string; username: string },
): Promise<string> => {
    const cleanServerUrl = url.replace(/\/$/, '');

    const res = await fbApiClient({ url: cleanServerUrl }).authenticate({
        body: {
            password: body.password,
            username: body.username,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to authenticate');
    }

    return res.body.data;
};

const download = async (
    url: string,
    token: string,
    args: DownloadArgs,
): Promise<DownloadResponse> => {
    const { query } = args;

    const cleanServerUrl = url.replace(/\/$/, '');
    const res = await fbApiClient({
        responseType: 'stream',
        token,
        url: cleanServerUrl,
    }).download({
        params: {
            filename: query.filename,
        },
    });

    if (res.status !== 200) {
        throw new Error(`Failed to download ${query.filename} with response ${res}`);
    }
    console.log('res', res);

    return { data: res.body.data };
};

const upload = async (url: string, token: string, args: UploadArgs): Promise<null> => {
    const { body, query } = args;

    const cleanServerUrl = url.replace(/\/$/, '');
    console.log('uploading', query.filename);
    const res = await fbApiClient({
        token,
        url: cleanServerUrl,
        useRaw: true,
    }).upload({
        body: body.fileBytes,
        params: { filename: `${query.filename}?override=true` },
    });

    if (res.status !== 200) {
        throw new Error(`Failed to upload ${query.filename} with response ${res}`);
    }
    return null;
};
export const fbController = {
    authenticate,
    download,
    upload,
};
