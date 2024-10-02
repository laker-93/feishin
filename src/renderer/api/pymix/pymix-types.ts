import { z } from 'zod';

const error = z.string();

const create = z.null({});
const login = z.null({});
const sync = z.null({});
const beetsImport = z.object({
    beets_output: z.string(),
    imported_tracks: z.number(),
    n_tracks_fir_imort: z.number(),
    reason: z.string(),
    success: z.boolean(),
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

const importParameters = z.null({});

export const pymixType = {
    _parameters: {
        create: createParameters,
        import: importParameters,
        login: loginParameters,
        rbExport: rbExportParameters,
        sync: syncParameters,
    },
    _response: {
        beetsImport,
        create,
        error,
        login,
        rbExport,
        rbImport,
        seratoImport,
        sync,
    },
};
