import { z } from 'zod';

const error = z.string();

const authenticate = z.string({});

const authenticateParameters = z.object({
    password: z.string(),
    username: z.string(),
});

const fileBytesParameters = z.instanceof(ArrayBuffer);

const download = z.any({});

const upload = z.null({});

export const fbType = {
    _parameters: {
        authenticate: authenticateParameters,
        fileBytes: fileBytesParameters,
    },
    _response: {
        authenticate,
        download,
        error,
        upload,
    },
};
