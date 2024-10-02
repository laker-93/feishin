import { Text, Box, Button } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { t } from 'i18next';
import { RiAccountBoxLine, RiLoginBoxLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { ContextModalVars } from '/@/renderer/components';
import { CreateAccountForm } from '/@/renderer/features/servers/components/create-account-form';
import { AddServerForm } from '/@/renderer/features/servers';

export const AboutContent = () => {
    const handleLogOnModal = () => {
        openContextModal({
            innerProps: {
                // eslint-disable-next-line react/no-unstable-nested-components
                modalBody: (vars: ContextModalVars) => (
                    <AddServerForm onCancel={() => vars.context.closeModal(vars.id)} />
                ),
            },
            modal: 'base',
            title: t('form.logon.title', { postProcess: 'titleCase' }),
        });
    };

    const handleCreateAccountModal = () => {
        openContextModal({
            innerProps: {
                // eslint-disable-next-line react/no-unstable-nested-components
                modalBody: (vars: ContextModalVars) => (
                    <CreateAccountForm onCancel={() => vars.context.closeModal(vars.id)} />
                ),
            },
            modal: 'base',
            title: t('form.createAccount.title', { postProcess: 'titleCase' }),
        });
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text>Sub-box is a music player with tools for DJs. </Text>
            <Text>
                Users can browse mixes <Link to="/library/mixes"> here</Link>.{' '}
            </Text>
            <Text>
                To upload your own music collection or use the DJ tools, you will need to create an
                account
            </Text>
            <Button
                p="0.5rem"
                size="md"
                variant="default"
                onClick={handleCreateAccountModal}
            >
                <RiAccountBoxLine size="1.5rem" />
            </Button>
            <Text>or if you already have an account, logon</Text>
            <Button
                p="0.5rem"
                size="md"
                variant="default"
                onClick={handleLogOnModal}
            >
                <RiLoginBoxLine size="1.5rem" />
            </Button>
        </Box>
    );
};
