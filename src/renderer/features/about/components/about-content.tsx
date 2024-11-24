import { Box, Text, Button, Group } from '@mantine/core';
import { RiAccountBoxLine, RiLoginBoxLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
// import { useCurrentServer } from '/@/renderer/store';

export const AboutContent = () => {
    // const server = useCurrentServer();
    // todo use current server to determine if user logged in, if so show a different view.
    const handleCreateAccountModal = () => {
        // Handle create account modal logic
    };

    const handleLogOnModal = () => {
        // Handle log on modal logic
    };

    return (
        <Box
            m={2}
            p={20}
        >
            <Text
                align="center"
                mb={20}
                size="xl"
                weight={700}
            >
                Sub-box is a music player with tools for DJs.
            </Text>
            <Text
                align="center"
                mb={20}
                size="md"
            >
                Users can browse mixes <Link to="/library/mixes">here</Link>.
            </Text>
            <Text
                align="center"
                mb={20}
                size="md"
            >
                To upload your own music collection and use the DJ tools, you will need to create an
                account.
            </Text>
            <Group
                mb={20}
                position="center"
            >
                <Button
                    size="md"
                    variant="default"
                    onClick={handleCreateAccountModal}
                >
                    <RiAccountBoxLine size="1.5rem" />
                    <Text ml={10}>Create Account</Text>
                </Button>
            </Group>
            <Text
                align="center"
                mb={20}
                size="md"
            >
                or if you already have an account, login
            </Text>
            <Group position="center">
                <Button
                    size="md"
                    variant="default"
                    onClick={handleLogOnModal}
                >
                    <RiLoginBoxLine size="1.5rem" />
                    <Text ml={10}>Login</Text>
                </Button>
            </Group>
        </Box>
    );
};
