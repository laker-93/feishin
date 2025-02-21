import { useState } from 'react';
import { Stack, Group, Checkbox } from '@mantine/core';
import { Button, PasswordInput, TextInput, toast } from '/@/renderer/components';
import { useForm } from '@mantine/form';
import { useFocusTrap } from '@mantine/hooks';
import { closeAllModals } from '@mantine/modals';
import isElectron from 'is-electron';
import { nanoid } from 'nanoid/non-secure';
import { AuthenticationResponse } from '/@/renderer/api/types';
import { useAuthStoreActions } from '/@/renderer/store';
import { ServerType, toServerType } from '/@/renderer/types';
import { api } from '/@/renderer/api';
import { useTranslation } from 'react-i18next';
import { pymixController } from '/@/renderer/api/pymix/pymix-controller';
import { fbController } from '../../../api/filebrowser/filebrowser-controller';

const urlConfig = JSON.parse(process.env.URL_CONFIG);
const localSettings = isElectron() ? window.electron.localSettings : null;

interface AddServerFormProps {
    onCancel: () => void;
}

export const AddServerForm = ({ onCancel }: AddServerFormProps) => {
    const { t } = useTranslation();
    const focusTrapRef = useFocusTrap(true);
    const [isLoading, setIsLoading] = useState(false);
    const { addServer, setCurrentServer } = useAuthStoreActions();

    const form = useForm({
        initialValues: {
            legacyAuth: false,
            name: (localSettings ? localSettings.env.SERVER_NAME : window.SERVER_NAME) ?? '',
            password: '',
            savePassword: false,
            type:
                (localSettings
                    ? localSettings.env.SERVER_TYPE
                    : toServerType(window.SERVER_TYPE)) ?? ServerType.NAVIDROME,
            url: (localSettings ? localSettings.env.SERVER_URL : window.SERVER_URL) ?? 'https://',
            username: '',
        },
    });

    const isSubmitDisabled = !form.values.username;

    const handleSubmit = form.onSubmit(async (values) => {
        const authFunction = api.controller.authenticate;

        if (!authFunction) {
            return toast.error({
                message: t('error.invalidServer', { postProcess: 'sentenceCase' }),
            });
        }

        // for local testing
        // const url = `http://localhost:4533`;
        // for production
        // const url = `https://www.sub-box.net/navidrome${values.username}`;
        const url = `${urlConfig.url.navidrome_user}${values.username}`;

        try {
            setIsLoading(true);
            const data: AuthenticationResponse | undefined = await authFunction(
                url,
                {
                    legacy: values.legacyAuth,
                    password: values.password,
                    username: values.username,
                },
                values.type as ServerType,
            );

            if (!data) {
                return toast.error({
                    message: t('error.authenticationFailed', { postProcess: 'sentenceCase' }),
                });
            }
            await pymixController.login({
                body: {
                    password: values.password,
                    username: values.username,
                },
            });
            // const fbToken = 'foo';
            let fbToken = null;
            // todo this is only valid once the user has created an account.
            // const fbUrl = 'https://browser.sub-box.net/browser';
            const fbUrl = urlConfig.url.filebrowser;
            // cannot test with localhost due to cors limitations. todo put local filebrowser behind traefik with cors proxy to allow for local testing
            // const fbUrl = `http://localhost:8081`;
            fbToken = await fbController.authenticate(fbUrl, {
                password: values.password,
                username: values.username,
            });
            if (!fbToken) {
                toast.error({
                    message: t('error.authenticationFailed', { postProcess: 'sentenceCase' }),
                });
            }
            console.log(`fbData: ${fbToken}`);

            const serverItem = {
                credential: data.credential,
                fbToken,
                id: nanoid(),
                isPublic: false,
                name: data.username,
                ndCredential: data.ndCredential,
                type: values.type as ServerType,
                url: url.replace(/\/$/, ''),
                userId: data.userId,
                username: data.username,
            };

            addServer(serverItem);
            setCurrentServer(serverItem);

            closeAllModals();

            toast.success({
                message: t('form.logon.success', { postProcess: 'sentenceCase' }),
            });

            if (localSettings && values.savePassword) {
                const saved = await localSettings.passwordSet(values.password, serverItem.id);
                if (!saved) {
                    toast.error({
                        message: t('form.logon.error', {
                            context: 'savePassword',
                            postProcess: 'sentenceCase',
                        }),
                    });
                }
            }
        } catch (err: any) {
            setIsLoading(false);
            return toast.error({ message: err?.message });
        }

        return setIsLoading(false);
    });

    return (
        <form onSubmit={handleSubmit}>
            <Stack
                ref={focusTrapRef}
                m={5}
            >
                <TextInput
                    label={t('form.logon.input', {
                        context: 'username',
                        postProcess: 'titleCase',
                    })}
                    {...form.getInputProps('username')}
                />
                <PasswordInput
                    label={t('form.logon.input', {
                        context: 'password',
                        postProcess: 'titleCase',
                    })}
                    {...form.getInputProps('password')}
                />
                {localSettings && form.values.type === ServerType.NAVIDROME && (
                    <Checkbox
                        label={t('form.logon.input', {
                            context: 'savePassword',
                            postProcess: 'titleCase',
                        })}
                        {...form.getInputProps('savePassword', {
                            type: 'checkbox',
                        })}
                    />
                )}
                <Group position="right">
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                    >
                        {t('common.cancel', { postProcess: 'titleCase' })}
                    </Button>
                    <Button
                        disabled={isSubmitDisabled}
                        loading={isLoading}
                        type="submit"
                        variant="filled"
                    >
                        {t('common.ok', { postProcess: 'titleCase' })}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
