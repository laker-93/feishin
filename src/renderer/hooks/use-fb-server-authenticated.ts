import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore, useCurrentServer } from '/@/renderer/store';
import { AuthState, ServerListItem, ServerType } from '/@/renderer/types';
import { debounce } from 'lodash';
import { toast } from '/@/renderer/components';
import { fbController } from '/@/renderer/api/filebrowser/filebrowser-controller';

const urlConfig = JSON.parse(process.env.URL_CONFIG);

const fbUrl = urlConfig.url.filebrowser;
export const useFBServerAuthenticated = () => {
    const priorServerId = useRef<string>();
    const server = useCurrentServer();
    const [ready, setReady] = useState(
        server?.type === ServerType.NAVIDROME ? AuthState.LOADING : AuthState.VALID,
    );

    const authenticateFB = useCallback(async (server: ServerListItem) => {
        try {
            await fbController.listUploads(fbUrl, server.fbToken!);
            setReady(AuthState.VALID);
        } catch (error) {
            toast.error({ message: (error as Error).message });
            setReady(AuthState.INVALID);
            const currentServer = useAuthStore.getState().currentServer;
            if (currentServer) {
                console.log('clearning current server');
                useAuthStore.getState().actions.updateServer(currentServer.id, {
                    credential: undefined,
                    fbToken: undefined,
                    ndCredential: undefined,
                });
                useAuthStore.getState().actions.setCurrentServer(null);
            }
        }
    }, []);

    const debouncedAuth = debounce((server: ServerListItem) => {
        authenticateFB(server).catch(console.error);
    }, 300);

    useEffect(() => {
        if (priorServerId.current !== server?.id) {
            priorServerId.current = server?.id || '';

            if (server?.type === ServerType.NAVIDROME) {
                setReady(AuthState.LOADING);
                debouncedAuth(server);
            } else {
                setReady(AuthState.VALID);
            }
        }
    }, [debouncedAuth, server]);

    return ready;
};
