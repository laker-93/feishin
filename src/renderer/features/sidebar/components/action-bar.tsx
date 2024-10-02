import { Grid, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
    RiSearchLine,
    RiMenuFill,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiAccountBoxLine,
    RiLoginBoxLine,
} from 'react-icons/ri';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { Button, ContextModalVars, DropdownMenu, TextInput } from '/@/renderer/components';
import { AppMenu } from '/@/renderer/features/titlebar/components/app-menu';
import { useContainerQuery } from '/@/renderer/hooks';
import { useCommandPalette, useCurrentServer } from '/@/renderer/store';
import { openContextModal } from '@mantine/modals';
import { AddServerForm } from '/@/renderer/features/servers';
import { CreateAccountForm } from '/@/renderer/features/servers/components/create-account-form';

const ActionsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 70px;
    -webkit-app-region: drag;

    input {
        -webkit-app-region: no-drag;
    }
`;

export const ActionBar = () => {
    const { t } = useTranslation();
    const cq = useContainerQuery({ md: 300 });
    const navigate = useNavigate();
    const { open } = useCommandPalette();
    const currentServer = useCurrentServer();
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
        <ActionsContainer ref={cq.ref}>
            {cq.isMd ? (
                currentServer ? (
                    <Grid
                        display="flex"
                        gutter="sm"
                        px="1rem"
                        w="100%"
                    >
                        <Grid.Col span={6}>
                            <TextInput
                                readOnly
                                icon={<RiSearchLine />}
                                placeholder={t('common.search', { postProcess: 'titleCase' })}
                                size="md"
                                onClick={open}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        open();
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group
                                grow
                                noWrap
                                spacing="sm"
                            >
                                <DropdownMenu position="bottom-start">
                                    <DropdownMenu.Target>
                                        <Button
                                            p="0.5rem"
                                            size="md"
                                            variant="default"
                                        >
                                            <RiMenuFill size="1rem" />
                                        </Button>
                                    </DropdownMenu.Target>
                                    <DropdownMenu.Dropdown>
                                        <AppMenu />
                                    </DropdownMenu.Dropdown>
                                </DropdownMenu>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={() => navigate(-1)}
                                >
                                    <RiArrowLeftSLine size="1.5rem" />
                                </Button>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={() => navigate(1)}
                                >
                                    <RiArrowRightSLine size="1.5rem" />
                                </Button>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={handleCreateAccountModal}
                                >
                                    <RiAccountBoxLine size="1.5rem" />
                                </Button>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={handleLogOnModal}
                                >
                                    <RiLoginBoxLine size="1.5rem" />
                                </Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                ) : (
                    <Grid
                        display="flex"
                        gutter="sm"
                        px="1rem"
                        w="100%"
                    >
                        <Grid.Col span={6}>
                            <TextInput
                                readOnly
                                icon={<RiSearchLine />}
                                placeholder={t('common.search', { postProcess: 'titleCase' })}
                                size="md"
                                onClick={open}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        open();
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group
                                grow
                                noWrap
                                spacing="sm"
                            >
                                <DropdownMenu position="bottom-start">
                                    <DropdownMenu.Target>
                                        <Button
                                            p="0.5rem"
                                            size="md"
                                            variant="default"
                                        >
                                            <RiMenuFill size="1rem" />
                                        </Button>
                                    </DropdownMenu.Target>
                                    <DropdownMenu.Dropdown>
                                        <AppMenu />
                                    </DropdownMenu.Dropdown>
                                </DropdownMenu>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={() => navigate(-1)}
                                >
                                    <RiArrowLeftSLine size="1.5rem" />
                                </Button>
                                <Button
                                    p="0.5rem"
                                    size="md"
                                    variant="default"
                                    onClick={() => navigate(1)}
                                >
                                    <RiArrowRightSLine size="1.5rem" />
                                </Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                )
            ) : (
                <Group
                    grow
                    px="1rem"
                    spacing="sm"
                    w="100%"
                >
                    <Button
                        p="0.5rem"
                        size="md"
                        variant="default"
                        onClick={open}
                    >
                        <RiSearchLine size="1rem" />
                    </Button>
                    <DropdownMenu position="bottom-start">
                        <DropdownMenu.Target>
                            <Button
                                p="0.5rem"
                                size="md"
                                variant="default"
                            >
                                <RiMenuFill size="1rem" />
                            </Button>
                        </DropdownMenu.Target>
                        <DropdownMenu.Dropdown>
                            <AppMenu />
                        </DropdownMenu.Dropdown>
                    </DropdownMenu>
                    <Button
                        p="0.5rem"
                        size="md"
                        variant="default"
                        onClick={() => navigate(-1)}
                    >
                        <RiArrowLeftSLine size="1.5rem" />
                    </Button>
                    <Button
                        p="0.5rem"
                        size="md"
                        variant="default"
                        onClick={() => navigate(1)}
                    >
                        <RiArrowRightSLine size="1.5rem" />
                    </Button>
                </Group>
            )}
        </ActionsContainer>
    );
};
