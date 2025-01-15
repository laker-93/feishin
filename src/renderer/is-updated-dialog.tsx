import { useCallback, useState } from 'react';
import { Group, Stack } from '@mantine/core';
import { Button, Dialog, Text } from './components';

export const IsUpdatedDialog = () => {
    const [value, setValue] = useState(true);

    const handleDismiss = useCallback(() => {
        setValue(false);
    }, [setValue]);

    return (
        <Dialog
            opened={value}
            position={{ bottom: '5rem', right: '1rem' }}
            styles={{
                root: {
                    marginBottom: '50px',
                    right: '1rem',
                },
            }}
        >
            <Stack>
                <Text>
                    note that sub-box is not built for mobile. Please access via a computer.
                </Text>
                <Group noWrap>
                    <Button
                        variant="default"
                        onClick={handleDismiss}
                    >
                        Dismiss
                    </Button>
                </Group>
            </Stack>
        </Dialog>
    );
};
