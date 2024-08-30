import { z } from 'zod';

const error = z.string();

const authenticate = z.string({});

const authenticateParameters = z.object({
    password: z.string(),
    username: z.string(),
});

const download = z.any({});

export const fbType = {
    _parameters: {
        authenticate: authenticateParameters,
    },
    _response: {
        authenticate,
        download,
        error,
    },
};
