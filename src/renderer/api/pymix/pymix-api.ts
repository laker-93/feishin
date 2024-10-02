import { initClient, initContract } from '@ts-rest/core';
import axios, { Method, AxiosError, AxiosResponse, isAxiosError } from 'axios';
import omitBy from 'lodash/omitBy';
import qs from 'qs';
import { pymixType } from './pymix-types';
import { resultWithHeaders } from '/@/renderer/api/utils';
import { ServerListItem } from '/@/renderer/api/types';
import i18n from '/@/i18n/i18n';

const c = initContract();

export const contract = c.router({
    create: {
        body: pymixType._parameters.create,
        method: 'POST',
        path: 'user/create',
        responses: {
            200: resultWithHeaders(pymixType._response.create),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    import: {
        body: {},
        method: 'POST',
        path: 'beets/import/:public',
        responses: {
            200: resultWithHeaders(pymixType._response.beetsImport),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    login: {
        body: pymixType._parameters.login,
        method: 'POST',
        path: 'user/login',
        responses: {
            200: resultWithHeaders(pymixType._response.login),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    rbDownload: {
        body: pymixType._parameters.rbExport,
        method: 'POST',
        path: 'rekordbox/export',
        responses: {
            200: resultWithHeaders(pymixType._response.login),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    rbImport: {
        body: {},
        method: 'POST',
        path: 'rekordbox/import',
        responses: {
            200: resultWithHeaders(pymixType._response.rbImport),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    seratoImport: {
        body: {},
        method: 'POST',
        path: 'serato/import',
        responses: {
            200: resultWithHeaders(pymixType._response.seratoImport),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
    sync: {
        body: pymixType._parameters.sync,
        method: 'POST',
        path: 'sync',
        responses: {
            200: resultWithHeaders(pymixType._response.sync),
            500: resultWithHeaders(pymixType._response.error),
        },
    },
});

const axiosClient = axios.create({
    withCredentials: true, // Enable sending and receiving cookies
});

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

export const pymixApiClient = (args: { server: ServerListItem | null; url?: string }) => {
    const { server, url } = args;

    return initClient(contract, {
        api: async ({ path, method, headers, body }) => {
            let baseUrl: string | undefined;

            const { params, path: api } = parsePath(path);

            if (server) {
                baseUrl = `${server?.url}/api`;
            } else {
                baseUrl = url;
            }

            try {
                if (shouldDelay) await waitForResult();
                console.log('baseUrl', baseUrl);
                console.log('data', body);
                console.log('params', params);
                console.log('json base headers');

                const result = await axiosClient.request({
                    data: body,
                    headers,
                    method: method as Method,
                    params,
                    url: `${baseUrl}/${api}`,
                });
                return {
                    body: { data: result.data, headers: result.headers },
                    headers: result.headers as any,
                    status: result.status,
                };
            } catch (e: Error | AxiosError | any) {
                if (isAxiosError(e)) {
                    if (e.code === 'ERR_NETWORK') {
                        throw new Error(
                            i18n.t('error.networkError', {
                                postProcess: 'sentenceCase',
                            }) as string,
                        );
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
