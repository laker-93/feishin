import { useCallback, useEffect, useState } from 'react';
import { AuthState } from '/@/renderer/types';
import { debounce } from 'lodash';
import { toast } from '/@/renderer/components';
import { useTranslation } from 'react-i18next';
import { fbController } from '../../main/features/core/filebrowser/filebrowser-controller';

export const useAuthenticateFBServer = () => {
    const { t } = useTranslation();
    const [ready, setReady] = useState(AuthState.LOADING);

    const authenticateFB = useCallback(async () => {
        try {
            const fbUrl = `http://localhost:8081`;
            const token = await fbController.authenticate(fbUrl, {
                password: 'lajp',
                username: 'lajp',
            });
            if (!token) {
                toast.error({
                    message: t('error.authenticationFailed', { postProcess: 'sentenceCase' }),
                });
            } else {
                setReady(AuthState.VALID);
            }
        } catch (error) {
            toast.error({ message: (error as Error).message });
            setReady(AuthState.INVALID);
        }
    }, [t]);

    const debouncedAuth = debounce(() => {
        authenticateFB().catch(console.error);
    }, 300);

    useEffect(() => {
        setReady(AuthState.LOADING);
        debouncedAuth();
        setReady(AuthState.VALID);
    }, [debouncedAuth]);

    return ready;
};
