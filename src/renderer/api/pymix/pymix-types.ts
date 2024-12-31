import { z } from 'zod';

const error = z.string();

const create = z.null({});
const login = z.null({});
const sync = z.null({});

const deleteDuplicates = z.object({
    duplicates_removed: z.array(z.string()),
    reason: z.string(),
    success: z.boolean(),
});
const importJob = z.object({
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
    result: z.boolean(),
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

const exportJob = z.object({
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

const rbImportParameters = z.object({
    username: z.string(),
});

const importProgressParameters = z.object({
    job_id: z.string(),
    public: z.boolean(),
});

const deleteParameters = z.object({
    public: z.boolean(),
});

export const pymixType = {
    _parameters: {
        create: createParameters,
        deleteDuplicates: deleteParameters,
        exportJob: rbExportParameters,
        import: importParameters,
        importProgress: importProgressParameters,
        login: loginParameters,
        rbImport: rbImportParameters,
        sync: syncParameters,
    },
    _response: {
        beetsImportProgress,
        create,
        deleteDuplicates,
        error,
        exportJob,
        importJob,
        login,
        rbImport,
        seratoImport,
        sync,
    },
};
