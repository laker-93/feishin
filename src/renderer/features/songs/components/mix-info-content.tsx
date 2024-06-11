import { MutableRefObject } from 'react';
import type { AgGridReact as AgGridReactType } from '@ag-grid-community/react/lib/agGridReact';
import { Box, Group, Timeline, Text } from '@mantine/core';
import { RiSettings2Fill } from 'react-icons/ri';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { LibraryItem } from '/@/renderer/api/types';
import { Button, Popover, Spinner } from '/@/renderer/components';
import { usePlayQueueAdd } from '/@/renderer/features/player';
import { PlayButton } from '/@/renderer/features/shared';
import { LibraryBackgroundOverlay } from '/@/renderer/features/shared/components/library-background-overlay';
import { useCurrentServer, useCurrentTime } from '/@/renderer/store';
import {
    usePlayButtonBehavior,
} from '/@/renderer/store/settings.store';
import { Play } from '/@/renderer/types';
import { useTrackList } from '/@/renderer/features/songs/queries/track-list-query';
import { useBeetTrack } from '/@/renderer/features/songs/queries/get-beet-id-query';


const ContentContainer = styled.div`
    position: relative;
    z-index: 0;
`;

const DetailContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem 2rem 5rem;
    overflow: hidden;
`;

interface MixInfoContentProps {
    background?: string;
    tableRef: MutableRefObject<AgGridReactType | null>;
}

export const MixInfoContent = ({ background }: MixInfoContentProps) => {
    const { songId } = useParams() as { songId: string };
    const server = useCurrentServer();
    const beetTrack = useBeetTrack({ query: { id: songId, user: 'foo'  }, serverId: server?.id });
    console.log(`lajp beet track ${beetTrack.data?.results[0].id}`);
    const beetId = beetTrack.data?.results[0].id;
    const detailQuery = useTrackList({ query: { track_id: beetId! }, serverId: server?.id });
    const tracklist = detailQuery.data;
    // todo make a 'mix' route where the params are the beets id
    // console.log(`lajp get track list for id ${id}`);

    console.log(`lajp tracklist ${detailQuery.data}`);
    const handlePlayQueueAdd = usePlayQueueAdd();
    console.log(`lajp got track list response ${detailQuery}`);


    const playButtonBehavior = usePlayButtonBehavior();

    const handlePlay = async (playType?: Play) => {
        handlePlayQueueAdd?.({
            byItemType: {id: [songId], type: LibraryItem.SONG},
            playType: playType || playButtonBehavior,
        });
    };

    const now = useCurrentTime();

    if (!tracklist || !beetId) {
        return <Spinner container />;
    }
    debugger


    return (
        <ContentContainer>
            <LibraryBackgroundOverlay $backgroundColor={background} />
            <DetailContainer>
                <Box component="section">
                    <Group
                        position="apart"
                        spacing="sm"
                    >
                        <Group>
                            <PlayButton onClick={() => handlePlay(playButtonBehavior)} />
                        </Group>
                        <Popover position="bottom-end">
                            <Popover.Target>
                                <Button
                                    compact
                                    size="md"
                                    variant="subtle"
                                >
                                    <RiSettings2Fill size={20} />
                                </Button>
                            </Popover.Target>
                        </Popover>
                    </Group>
                </Box>
                <Box style={{ minHeight: '300px' }}>
                  <Timeline active={1} bulletSize={24} lineWidth={2}>
                    {tracklist.items.map((track) => (
                      <Timeline.Item title={`${track.artist} - ${track.title}`}>
                        <Text c="dimmed" size="sm">{track.start} to {track.end}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Box>
            </DetailContainer>
        </ContentContainer>
    );
};
