import { pymixApiClient } from '/@/renderer/api/pymix/pymix-api';

type CreateBody = {
    email: string;
    password: string;
    username: string;
};
type CreateArgs = { body: CreateBody };

type LoginBody = {
    password: string;
    username: string;
};
type LoginArgs = { body: LoginBody };

type RBDownloadBody = {
    user_root: string;
};
type RBDownloadArgs = { body: RBDownloadBody };

type Track = {
    artist: string;
    title: string;
};
type TracksArgs = Track[];

type ImportArgs = { query: { public: boolean } };

const create = async (body: CreateArgs): Promise<null> => {
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).create({
        body: {
            email: body.body.email,
            password: body.body.password,
            username: body.body.username,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to create account');
    }

    return null;
};

const login = async (body: LoginArgs): Promise<null> => {
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).login({
        body: {
            password: body.body.password,
            username: body.body.username,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to create account');
    }

    return null;
};

const rbDownload = async (body: RBDownloadArgs): Promise<null> => {
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).rbDownload({
        body: {
            user_root: body.body.user_root,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to create account');
    }
    console.log(res);

    return null;
};

const sync = async (body: TracksArgs): Promise<null> => {
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).sync({
        body: { tracks: body },
    });

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return null;
};

const beetsImport = async (args: ImportArgs): Promise<null> => {
    const { query } = args;
    let publicStr = 'False';
    if (query.public === true) {
        publicStr = 'True';
    }
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).import({
        params: { public: publicStr },
    });

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return null;
};

const rbImport = async (): Promise<null> => {
    const res = await pymixApiClient({
        server: null,
        url: 'http://localhost:8002',
    }).rbImport();

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return null;
};

export const pymixController = {
    beetsImport,
    create,
    login,
    rbDownload,
    rbImport,
    sync,
};
