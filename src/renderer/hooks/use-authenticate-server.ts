import { useCallback, useEffect, useState } from 'react';
import { useAuthStoreActions } from '/@/renderer/store';
import { AuthState, ServerType } from '/@/renderer/types';
import { api } from '/@/renderer/api';
import { AuthenticationResponse } from '/@/renderer/api/types';
import { toast } from '/@/renderer/components';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';

const urlConfig = JSON.parse(process.env.URL_CONFIG);

export const useAuthenticateServer = () => {
    const { t } = useTranslation();
    const { addPublicServer, getPublicServer } = useAuthStoreActions();
    const publicServer = getPublicServer();
    const [ready, setReady] = useState(
        publicServer?.type === ServerType.NAVIDROME ? AuthState.LOADING : AuthState.VALID,
    );

    const authenticateNavidrome = useCallback(async () => {
        // This trick works because navidrome-api.ts will internally check for authentication
        // failures and try to log in again (where available). So, all that's necessary is
        // making one request first
        try {
            // const publicUrl = `http://localhost:4534`;
            // const publicUrl = `https://www.sub-box.net/navidromelajp`;
            const publicUrl = urlConfig.url.navidrome_public;
            console.log('authenticate public navidrome');
            const publicData: AuthenticationResponse | undefined =
                await api.controller.authenticate(
                    publicUrl,
                    {
                        password: 'lajp',
                        username: 'lajp',
                    },
                    ServerType.NAVIDROME,
                );

            if (!publicData) {
                toast.error({
                    message: t('error.authenticationFailed', { postProcess: 'sentenceCase' }),
                });
            } else {
                console.log('got public server', publicServer);
                console.log('authentication response', publicData);
                if (!publicServer && publicData.credential) {
                    const publicServerItem = {
                        credential: publicData.credential,
                        id: nanoid(),
                        isPublic: true,
                        name: publicData.username,
                        ndCredential: publicData.ndCredential,
                        savePassword: true,
                        type: ServerType.NAVIDROME,
                        url: publicUrl.replace(/\/$/, ''),
                        userId: publicData.userId,
                        username: publicData.username,
                    };
                    console.log('adding public server', publicServerItem);
                    addPublicServer(publicServerItem);
                } else {
                    console.log('updating public server with credential', publicData.credential);
                    // updateServer(publicServer.id, { credential: publicData.credential })
                }

                setReady(AuthState.VALID);
            }
        } catch (error) {
            console.log('error');
            toast.error({ message: (error as Error).message });
            setReady(AuthState.INVALID);
        }
    }, [addPublicServer, t, publicServer]);

    useEffect(() => {
        setReady(AuthState.LOADING);
        authenticateNavidrome().catch(console.error);
    }, [authenticateNavidrome]);

    return ready;
};
