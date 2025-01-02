import { pymixApiClient } from '/@/renderer/api/pymix/pymix-api';
import { BeetImportProgress } from '/@/renderer/api/types';

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
type ImportProgressArgs = { query: { jobId: string; public: boolean } };

const create = async (body: CreateArgs): Promise<null> => {
    const res = await pymixApiClient().create({
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
        throw new Error('Failed to create rb info xml');
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

const rbImport = async (): Promise<string> => {
    const res = await pymixApiClient().rbImport({});
    if (res.status !== 200) {
        throw new Error('Failed to sync');
    }

    return res.body.data.job_id;
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
    login,
    rbDownload,
    rbImport,
    seratoDownload,
    seratoImport,
    sync,
};
