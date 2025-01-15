import { openContextModal } from '@mantine/modals';
import isElectron from 'is-electron';
import { useTranslation } from 'react-i18next';
import {
    RiAccountBoxLine,
    RiWindowFill,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiLayoutRightLine,
    RiLayoutLeftLine,
    RiSettings3Line,
    RiDiscordLine,
    RiExternalLinkLine,
    RiCloseCircleLine,
    RiLoginBoxLine,
} from 'react-icons/ri';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { ContextModalVars, DropdownMenu } from '/@/renderer/components';
import { AddServerForm } from '/@/renderer/features/servers';
import { CreateAccountForm } from '/@/renderer/features/servers/components/create-account-form';
import { AppRoute } from '/@/renderer/router/routes';
import {
    useSidebarStore,
    useAppStoreActions,
    useCurrentServer,
    useAuthStoreActions,
} from '/@/renderer/store';

const localSettings = isElectron() ? window.electron.localSettings : null;
const browser = isElectron() ? window.electron.browser : null;

export const AppMenu = () => {
    const currentServer = useCurrentServer();
    const isLoggedOn = currentServer && currentServer.credential;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { collapsed } = useSidebarStore();
    const { setSideBar } = useAppStoreActions();
    const { deleteServer } = useAuthStoreActions();

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
    const handleLogOffModal = () => {
        if (currentServer) {
            deleteServer(currentServer.id);
            localSettings?.passwordRemove(currentServer.name);
        }
    };

    const handleBrowserDevTools = () => {
        browser?.devtools();
    };

    const handleCollapseSidebar = () => {
        setSideBar({ collapsed: true });
    };

    const handleExpandSidebar = () => {
        setSideBar({ collapsed: false });
    };

    const handleQuit = () => {
        browser?.quit();
    };

    return (
        <>
            <DropdownMenu.Item
                icon={<RiArrowLeftSLine />}
                onClick={() => navigate(-1)}
            >
                {t('page.appMenu.goBack', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>
            <DropdownMenu.Item
                icon={<RiArrowRightSLine />}
                onClick={() => navigate(1)}
            >
                {t('page.appMenu.goForward', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>
            {collapsed ? (
                <DropdownMenu.Item
                    icon={<RiLayoutRightLine />}
                    onClick={handleExpandSidebar}
                >
                    {t('page.appMenu.expandSidebar', { postProcess: 'sentenceCase' })}
                </DropdownMenu.Item>
            ) : (
                <DropdownMenu.Item
                    icon={<RiLayoutLeftLine />}
                    onClick={handleCollapseSidebar}
                >
                    {t('page.appMenu.collapseSidebar', { postProcess: 'sentenceCase' })}
                </DropdownMenu.Item>
            )}
            <DropdownMenu.Divider />
            <DropdownMenu.Item
                component={Link}
                icon={<RiSettings3Line />}
                to={AppRoute.SETTINGS}
            >
                {t('page.appMenu.settings', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>
            <DropdownMenu.Item
                disabled={!!isLoggedOn}
                icon={<RiAccountBoxLine />}
                onClick={handleCreateAccountModal}
            >
                {t('page.appMenu.createAccount', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>

            <DropdownMenu.Item
                disabled={!!isLoggedOn}
                icon={<RiLoginBoxLine />}
                onClick={handleLogOnModal}
            >
                {t('page.appMenu.logon', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>
            <DropdownMenu.Item
                disabled={!isLoggedOn}
                icon={<RiLoginBoxLine />}
                onClick={handleLogOffModal}
            >
                {t('page.appMenu.logoff', { postProcess: 'sentenceCase' })}
            </DropdownMenu.Item>
            <DropdownMenu.Divider />
            <DropdownMenu.Item
                component="a"
                href="https://discord.gg/mqrRbex3hs"
                icon={<RiDiscordLine />}
                rightSection={<RiExternalLinkLine />}
                target="_blank"
            >
                {t('page.appMenu.discord', {
                    postProcess: 'sentenceCase',
                })}
            </DropdownMenu.Item>
            {isElectron() && (
                <>
                    <DropdownMenu.Divider />
                    <DropdownMenu.Item
                        icon={<RiWindowFill />}
                        onClick={handleBrowserDevTools}
                    >
                        {t('page.appMenu.openBrowserDevtools', { postProcess: 'sentenceCase' })}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        icon={<RiCloseCircleLine />}
                        onClick={handleQuit}
                    >
                        {t('page.appMenu.quit', { postProcess: 'sentenceCase' })}
                    </DropdownMenu.Item>
                </>
            )}
        </>
    );
};
