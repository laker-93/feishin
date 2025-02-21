import { initClient, initContract } from '@ts-rest/core';
import axios, { Method, AxiosError, AxiosResponse, isAxiosError } from 'axios';
import isElectron from 'is-electron';
import debounce from 'lodash/debounce';
import omitBy from 'lodash/omitBy';
import qs from 'qs';
import { ndType } from './navidrome-types';
import { authenticationFailure, resultWithHeaders } from '/@/renderer/api/utils';
import { useAuthStore } from '/@/renderer/store';
import { ServerListItem } from '/@/renderer/api/types';
import { toast } from '/@/renderer/components/toast';
import i18n from '/@/i18n/i18n';

const localSettings = isElectron() ? window.electron.localSettings : null;

const c = initContract();

export const contract = c.router({
    addToPlaylist: {
        body: ndType._parameters.addToPlaylist,
        method: 'POST',
        path: 'playlist/:id/tracks',
        responses: {
            200: resultWithHeaders(ndType._response.addToPlaylist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    authenticate: {
        body: ndType._parameters.authenticate,
        method: 'POST',
        path: 'auth/login',
        responses: {
            200: resultWithHeaders(ndType._response.authenticate),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    createPlaylist: {
        body: ndType._parameters.createPlaylist,
        method: 'POST',
        path: 'playlist',
        responses: {
            200: resultWithHeaders(ndType._response.createPlaylist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    deletePlaylist: {
        body: null,
        method: 'DELETE',
        path: 'playlist/:id',
        responses: {
            200: resultWithHeaders(ndType._response.deletePlaylist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    deleteSong: {
        body: ndType._parameters.deleteSong,
        method: 'DELETE',
        path: 'delete',
        query: null,
        responses: {
            200: resultWithHeaders(ndType._response.deleteSong),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getAlbumArtistDetail: {
        method: 'GET',
        path: 'artist/:id',
        responses: {
            200: resultWithHeaders(ndType._response.albumArtist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getAlbumArtistList: {
        method: 'GET',
        path: 'artist',
        query: ndType._parameters.albumArtistList,
        responses: {
            200: resultWithHeaders(ndType._response.albumArtistList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getAlbumDetail: {
        method: 'GET',
        path: 'album/:id',
        responses: {
            200: resultWithHeaders(ndType._response.album),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getAlbumList: {
        method: 'GET',
        path: 'album',
        query: ndType._parameters.albumList,
        responses: {
            200: resultWithHeaders(ndType._response.albumList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getBeetTrack: {
        method: 'GET',
        path: 'getBeetTrack',
        query: ndType._parameters.beetTrack,
        responses: {
            200: resultWithHeaders(ndType._response.beetResults),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getGenreList: {
        method: 'GET',
        path: 'genre',
        query: ndType._parameters.genreList,
        responses: {
            200: resultWithHeaders(ndType._response.genreList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getPlaylistDetail: {
        method: 'GET',
        path: 'playlist/:id',
        responses: {
            200: resultWithHeaders(ndType._response.playlist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getPlaylistList: {
        method: 'GET',
        path: 'playlist',
        query: ndType._parameters.playlistList,
        responses: {
            200: resultWithHeaders(ndType._response.playlistList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getPlaylistSongList: {
        method: 'GET',
        path: 'playlist/:id/tracks',
        query: ndType._parameters.songList,
        responses: {
            200: resultWithHeaders(ndType._response.playlistSongList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getSongDetail: {
        method: 'GET',
        path: 'song/:id',
        responses: {
            200: resultWithHeaders(ndType._response.song),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getSongList: {
        method: 'GET',
        path: 'song',
        query: ndType._parameters.songList,
        responses: {
            200: resultWithHeaders(ndType._response.songList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    getUserList: {
        method: 'GET',
        path: 'user',
        query: ndType._parameters.userList,
        responses: {
            200: resultWithHeaders(ndType._response.userList),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    movePlaylistItem: {
        body: ndType._parameters.moveItem,
        method: 'PUT',
        path: 'playlist/:playlistId/tracks/:trackNumber',
        responses: {
            200: resultWithHeaders(ndType._response.moveItem),
            400: resultWithHeaders(ndType._response.error),
        },
    },
    removeFromPlaylist: {
        body: null,
        method: 'DELETE',
        path: 'playlist/:id/tracks',
        query: ndType._parameters.removeFromPlaylist,
        responses: {
            200: resultWithHeaders(ndType._response.removeFromPlaylist),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    shareItem: {
        body: ndType._parameters.shareItem,
        method: 'POST',
        path: 'share',
        responses: {
            200: resultWithHeaders(ndType._response.shareItem),
            404: resultWithHeaders(ndType._response.error),
            500: resultWithHeaders(ndType._response.error),
        },
    },
    updatePlaylist: {
        body: ndType._parameters.updatePlaylist,
        method: 'PUT',
        path: 'playlist/:id',
        responses: {
            200: resultWithHeaders(ndType._response.updatePlaylist),
            500: resultWithHeaders(ndType._response.error),
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

let authSuccess = true;
let shouldDelay = false;

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

const limitedFail = debounce(authenticationFailure, RETRY_DELAY_MS);
const TIMEOUT_ERROR = Error();

axiosClient.interceptors.response.use(
    (response) => {
        const server = useAuthStore.getState().currentServer;
        const serverId = server?.id;
        // const publicServer = useAuthStore.getState().publicServer;
        // const publicServerId = publicServer?.id;

        if (serverId) {
            const headerCredential = response.headers['x-nd-authorization'] as string | undefined;

            const url = response.request.responseURL;
            if (headerCredential) {
                if (url === server.url) {
                    console.log('updating private server token');
                    useAuthStore.getState().actions.updateServer(serverId, {
                        ndCredential: headerCredential,
                    });
                }
            }
        }
        // if (publicServerId) {
        //    const headerCredential = response.headers['x-nd-authorization'] as string | undefined;

        //    const url = response.request.responseURL;
        //    if (headerCredential) {
        //        if (url === publicServer.url) {
        //            console.log('updating public server token');
        //            useAuthStore.getState().actions.updateServer(publicServerId, {
        //                ndCredential: headerCredential,
        //            });
        //        }
        //    }
        // }

        authSuccess = true;

        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentServer = useAuthStore.getState().currentServer;
            // const publicServer = useAuthStore.getState().publicServer;
            // const publicPassword = 'lajp';
            // const url = error.response.request.responseURL;

            // if (!currentServer) {
            //    if (publicServer && url.includes(publicServer.url)) {
            //        currentServer = publicServer;
            //    }
            // }
            if (localSettings && currentServer?.savePassword) {
                // eslint-disable-next-line promise/no-promise-in-callback
                return localSettings
                    .passwordGet(currentServer.id)
                    .then(async (password: string | null) => {
                        authSuccess = false;
                        const serverPassword = password;
                        console.log('serverPassword', serverPassword);
                        // if (publicServer && url.includes(publicServer.url)) {
                        //    serverPassword = publicPassword;
                        //    console.log('set serverPassword to publicPassword', serverPassword);
                        // }
                        if (shouldDelay) {
                            await waitForResult();

                            // Hopefully the delay was sufficient for authentication.
                            // Otherwise, it will require manual intervention
                            if (authSuccess) {
                                return axiosClient.request(error.config);
                            }

                            throw error;
                        }

                        shouldDelay = true;

                        // Do not use axiosClient. Instead, manually make a post
                        console.log('username: ', currentServer.username);
                        console.log('serverPassword: ', serverPassword);
                        console.log('url: ', currentServer.url);

                        const cleanServerUrl = currentServer.url.replace(/\/$/, '');
                        const res = await axios.post(`${cleanServerUrl}/auth/login`, {
                            password: serverPassword,
                            username: currentServer.username,
                        });

                        if (res.status === 429) {
                            toast.error({
                                message: i18n.t('error.loginRateError', {
                                    postProcess: 'sentenceCase',
                                }) as string,
                                title: i18n.t('error.sessionExpiredError', {
                                    postProcess: 'sentenceCase',
                                }) as string,
                            });

                            const serverId = currentServer.id;
                            console.log('setting credentials to undefined');
                            useAuthStore.getState().actions.updateServer(serverId, {
                                credential: undefined,
                                ndCredential: undefined,
                            });
                            useAuthStore.getState().actions.setCurrentServer(null);

                            // special error to prevent sending a second message, and stop other messages that could be enqueued
                            limitedFail.cancel();
                            throw TIMEOUT_ERROR;
                        }
                        if (res.status !== 200) {
                            const serverId = currentServer.id;
                            useAuthStore.getState().actions.updateServer(serverId, {
                                credential: undefined,
                                ndCredential: undefined,
                            });
                            useAuthStore.getState().actions.setCurrentServer(null);

                            throw new Error(
                                i18n.t('error.authenticatedFailed', {
                                    postProcess: 'sentenceCase',
                                }) as string,
                            );
                        }

                        const newCredential = res.data.token;
                        const subsonicCredential = `u=${currentServer.username}&s=${res.data.subsonicSalt}&t=${res.data.subsonicToken}`;

                        useAuthStore.getState().actions.updateServer(currentServer.id, {
                            credential: subsonicCredential,
                            ndCredential: newCredential,
                        });

                        error.config.headers['x-nd-authorization'] = `Bearer ${newCredential}`;

                        authSuccess = true;

                        return axiosClient.request(error.config);
                    })
                    .catch((newError: any) => {
                        if (newError !== TIMEOUT_ERROR) {
                            console.error('Error when trying to reauthenticate: ', newError);
                            limitedFail(currentServer);
                        }

                        // make sure to pass the error so axios will error later on
                        throw newError;
                    })
                    .finally(() => {
                        shouldDelay = false;
                    });
            }

            limitedFail(currentServer);
        }

        return Promise.reject(error);
    },
);

export const ndApiClient = (args: {
    server: ServerListItem | null;
    signal?: AbortSignal;
    url?: string;
}) => {
    const { server, url, signal } = args;

    return initClient(contract, {
        api: async ({ path, method, headers, body }) => {
            let baseUrl: string | undefined;
            let token: string | undefined;

            const { params, path: api } = parsePath(path);

            if (server) {
                baseUrl = `${server?.url}/api`;
                token = server?.ndCredential;
            } else {
                baseUrl = url;
            }

            try {
                if (shouldDelay) await waitForResult();
                const result = await axiosClient.request({
                    data: body,
                    headers: {
                        ...headers,
                        ...(token && { 'x-nd-authorization': `Bearer ${token}` }),
                    },
                    method: method as Method,
                    params,
                    signal,
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
