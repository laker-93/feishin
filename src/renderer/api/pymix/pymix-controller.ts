import { pymixApiClient } from '/@/renderer/api/pymix/pymix-api';
import { BeetImportProgress } from '/@/renderer/api/types';

type CreateBody = {
    email: string;
    password: string;
    token: string;
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
type ImportProgressArgs = { query: { jobId: string; public: boolean } };

const create = async (body: CreateArgs): Promise<null> => {
    const res = await pymixApiClient().create({
        body: {
            email: body.body.email,
            password: body.body.password,
            token: body.body.token,
            username: body.body.username,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to create account');
    }

    return null;
};

const login = async (body: LoginArgs): Promise<null> => {
    const res = await pymixApiClient().login({
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
    const res = await pymixApiClient().rbDownload({
        body: {
            user_root: body.body.user_root,
        },
    });

    if (res.status !== 200) {
        throw new Error(`Failed to create rb info xml with http status ${res.status}`);
    }
    if (!res.body.data.success) {
        throw new Error(`Failed to create rb info xml ${res.body.data.reason}`);
    }

    return null;
};

const sync = async (body: TracksArgs): Promise<null> => {
    const res = await pymixApiClient().sync({
        body: { tracks: body },
    });

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return null;
};

const beetsImport = async (args: ImportArgs): Promise<string> => {
    const { query } = args;

    const res = await pymixApiClient().import({
        body: { public: query.public },
    });

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return res.body.data.job_id;
};

const beetsImportProgress = async (args: ImportProgressArgs): Promise<BeetImportProgress> => {
    const { query } = args;

    const res = await pymixApiClient().importProgress({
        query: { job_id: query.jobId, public: query.public },
    });

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return {
        inProgress: res.body.data.in_progress,
        percentageComplete: res.body.data.percentage_complete,
        result: res.body.data.result,
    };
};

const validateToken = async (token: string): Promise<boolean> => {
    const res = await pymixApiClient().validateToken({ query: { token } });
    if (res.status !== 200) {
        throw new Error('Failed to validate token');
    }
    return res.body.data.is_valid_token;
};

const rbImport = async (): Promise<string> => {
    const res = await pymixApiClient().rbImport({});
    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return res.body.data.job_id;
};

const librarySize = async (): Promise<number> => {
    const res = await pymixApiClient().getLibrarySize();
    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }
    if (!res.body.data.success) {
        throw new Error(`Failed to get size of library ${res.body.data.reason}`);
    }
    return res.body.data.total_size_bytes;
};

const seratoImport = async (): Promise<null> => {
    const res = await pymixApiClient().seratoImport();

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return null;
};
const seratoDownload = async (body: RBDownloadArgs): Promise<null> => {
    const res = await pymixApiClient().seratoDownload({
        body: {
            user_root: body.body.user_root,
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to create serato crates');
    }

    return null;
};

const deleteDuplicates = async (): Promise<Array<string>> => {
    const res = await pymixApiClient().deleteDuplicates();

    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return res.body.data.duplicates_removed;
};

export const pymixController = {
    beetsImport,
    beetsImportProgress,
    create,
    deleteDuplicates,
    librarySize,
    login,
    rbDownload,
    rbImport,
    seratoDownload,
    seratoImport,
    sync,
    validateToken,
};
