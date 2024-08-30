import { initClient, initContract } from '@ts-rest/core';
import axios, { AxiosHeaders, Method, AxiosError, AxiosResponse, isAxiosError } from 'axios';
import omitBy from 'lodash/omitBy';
import qs from 'qs';
import { z } from 'zod';
import { fbType } from './filebrowser-types';

const c = initContract();
const resultWithHeaders = <ItemType extends z.ZodTypeAny>(itemSchema: ItemType) => {
    return z.object({
        data: itemSchema,
        headers: z.instanceof(AxiosHeaders),
    });
};

export const contract = c.router({
    authenticate: {
        body: fbType._parameters.authenticate,
        method: 'POST',
        path: 'api/login',
        responses: {
            200: resultWithHeaders(fbType._response.authenticate),
            500: resultWithHeaders(fbType._response.error),
        },
    },
    download: {
        method: 'GET',
        path: 'api/raw/downloads/:filename',
        responses: {
            200: resultWithHeaders(fbType._response.download),
            500: resultWithHeaders(fbType._response.error),
        },
    },
});

const axiosClient = axios.create({});

axiosClient.defaults.paramsSerializer = (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' });
};

const parsePath = (fullPath: string) => {
    const [path, params] = fullPath.split('?');

    const parsedParams = qs.parse(params);

    // Convert indexed object to array
    const newParams: Record<string, any> = {};
    Object.keys(parsedParams).forEach((key) => {
        const isIndexedArrayObject =
            typeof parsedParams[key] === 'object' &&
            Object.keys(parsedParams[key] || {}).includes('0');

        if (!isIndexedArrayObject) {
            newParams[key] = parsedParams[key];
        } else {
            newParams[key] = Object.values(parsedParams[key] || {});
        }
    });

    const notNilParams = omitBy(newParams, (value) => value === 'undefined' || value === 'null');

    return {
        params: notNilParams,
        path,
    };
};

const shouldDelay = false;

const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 5;

const waitForResult = async (count = 0): Promise<void> => {
    return new Promise((resolve) => {
        if (count === MAX_RETRIES || !shouldDelay) resolve();

        setTimeout(() => {
            waitForResult(count + 1)
                .then(resolve)
                .catch(resolve);
        }, RETRY_DELAY_MS);
    });
};

export const fbApiClient = (args: {
    responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream' | 'blob';
    token?: string;
    url: string;
}) => {
    const { token, url, responseType = 'json' } = args;

    return initClient(contract, {
        api: async ({ path, method, headers, body }) => {
            const { params, path: api } = parsePath(path);

            try {
                if (shouldDelay) await waitForResult();

                const result = await axiosClient.request({
                    data: body,
                    headers: {
                        ...headers,
                        ...(token && { 'X-Auth': `${token}` }),
                    },
                    method: method as Method,
                    params,
                    responseType,
                    url: `${url}/${api}`,
                });
                return {
                    body: { data: result.data, headers: result.headers },
                    headers: result.headers as any,
                    status: result.status,
                };
            } catch (e: Error | AxiosError | any) {
                if (isAxiosError(e)) {
                    if (e.code === 'ERR_NETWORK') {
                        throw new Error('network error with filebrowser');
                    }

                    const error = e as AxiosError;
                    const response = error.response as AxiosResponse;
                    return {
                        body: { data: response?.data, headers: response?.headers },
                        headers: response?.headers as any,
                        status: response?.status,
                    };
                }
                throw e;
            }
        },
        baseHeaders: {
            'Content-Type': 'application/json',
        },
        baseUrl: '',
        jsonQuery: false,
    });
};
