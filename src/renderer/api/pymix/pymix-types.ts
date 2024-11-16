import { z } from 'zod';

const error = z.string();

const create = z.null({});
const login = z.null({});
const sync = z.null({});
const beetsImport = z.object({
    job_id: z.string(),
    n_tracks_for_import: z.number(),
    reason: z.string(),
    success: z.boolean(),
});

const beetsImportProgress = z.object({
    in_progress: z.boolean(),
    n_tracks_processed: z.number(),
    n_tracks_to_process: z.number(),
    percentage_complete: z.number(),
    reason: z.string(),
});

const rbImport = z.object({
    beets_output: z.string(),
    imported_tracks: z.number(),
    n_tracks_fir_imort: z.number(),
    reason: z.string(),
    success: z.boolean(),
});
const seratoImport = z.object({
    beets_output: z.string(),
    imported_tracks: z.number(),
    n_tracks_fir_imort: z.number(),
    reason: z.string(),
    success: z.boolean(),
});

const rbExport = z.object({
    beets_output: z.string(),
    n_beets_tracks: z.number(),
    reason: z.string(),
    success: z.boolean(),
});

const createParameters = z.object({
    email: z.string(),
    password: z.string(),
    username: z.string(),
});

const loginParameters = z.object({
    password: z.string(),
    username: z.string(),
});

const rbExportParameters = z.object({
    user_root: z.string(),
});

const track = z.object({
    artist: z.string(),
    title: z.string(),
});

const syncParameters = z.object({
    tracks: z.array(track),
});

const importParameters = z.object({
    public: z.boolean(),
});

const importProgressParameters = z.object({
    jobId: z.string(),
    public: z.boolean(),
});

export const pymixType = {
    _parameters: {
        create: createParameters,
        import: importParameters,
        importProgress: importProgressParameters,
        login: loginParameters,
        rbExport: rbExportParameters,
        sync: syncParameters,
    },
    _response: {
        beetsImport,
        beetsImportProgress,
        create,
        error,
        login,
        rbExport,
        rbImport,
        seratoImport,
        sync,
    },
};
