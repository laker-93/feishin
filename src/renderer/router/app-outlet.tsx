import { useEffect, useMemo } from 'react';
import { Center } from '@mantine/core';
import isElectron from 'is-electron';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentServer, useSetPlayerFallback } from '/@/renderer/store';
import { Spinner, toast } from '/@/renderer/components';
import { AuthState } from '/@/renderer/types';
import { useServerAuthenticated } from '/@/renderer/hooks/use-server-authenticated';
import { AppRoute } from '/@/renderer/router/routes';
import { useFBServerAuthenticated } from '/@/renderer/hooks/use-fb-server-authenticated';

const ipc = isElectron() ? window.electron.ipc : null;
const utils = isElectron() ? window.electron.utils : null;
const mpvPlayerListener = isElectron() ? window.electron.mpvPlayerListener : null;

export const AppOutlet = () => {
    const authState = useServerAuthenticated();
    const fbAuthState = useFBServerAuthenticated();
    const currentServer = useCurrentServer();

    console.log('app outlet');
    const setFallback = useSetPlayerFallback();

    const isActionsRequired = useMemo(() => {
        return currentServer != null;
    }, [currentServer]);

    useEffect(() => {
        utils?.mainMessageListener((_event, data) => {
            toast.show(data);
        });

        mpvPlayerListener?.rendererPlayerFallback((_event, data) => {
            setFallback(data);
        });

        return () => {
            ipc?.removeAllListeners('toast-from-main');
            ipc?.removeAllListeners('renderer-player-fallback');
        };
    }, [setFallback]);

    if (authState === AuthState.LOADING || fbAuthState === AuthState.LOADING) {
        return (
            <Center
                h="100vh"
                w="100%"
            >
                <Spinner container />
            </Center>
        );
    }

    console.log('fbAuthState', fbAuthState);
    if (
        isActionsRequired &&
        (authState === AuthState.INVALID || fbAuthState === AuthState.INVALID)
    ) {
        console.log('action required');
        return (
            <Navigate
                replace
                to={AppRoute.ACTION_REQUIRED}
            />
        );
    }

    // if (authState === AuthState.INVALID) {
    //     throw new Error('Could not authenticate with public navidrome');
    // }

    return <Outlet />;
};
