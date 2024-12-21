import { Center, Group, Stack } from '@mantine/core';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '/@/renderer/components';
import { ActionRequiredContainer } from '/@/renderer/features/action-required/components/action-required-container';
import { LogonRequired } from '/@/renderer/features/action-required/components/server-required';
import { AnimatedPage } from '/@/renderer/features/shared';
import { AppRoute } from '/@/renderer/router/routes';
import { useCurrentServer } from '/@/renderer/store';

const ActionRequiredRoute = () => {
    const currentServer = useCurrentServer();
    const isServerRequired = !currentServer;

    const checks = [
        {
            component: <LogonRequired />,
            title: '',
            valid: !isServerRequired,
        },
    ];

    const canReturnHome = checks.every((c) => c.valid);
    const displayedCheck = checks.find((c) => !c.valid);

    if (canReturnHome) {
        return <Navigate to={AppRoute.HOME} />;
    }

    return (
        <AnimatedPage>
            <PageHeader />
            <Center sx={{ height: '100%', width: '100vw' }}>
                <Stack
                    spacing="xl"
                    sx={{ maxWidth: '50%' }}
                >
                    <Group noWrap>
                        {displayedCheck && (
                            <ActionRequiredContainer title={displayedCheck.title}>
                                {displayedCheck?.component}
                            </ActionRequiredContainer>
                        )}
                    </Group>
                </Stack>
            </Center>
        </AnimatedPage>
    );
};

export default ActionRequiredRoute;
