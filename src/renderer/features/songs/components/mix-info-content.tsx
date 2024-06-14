import { MutableRefObject } from 'react';
import type { AgGridReact as AgGridReactType } from '@ag-grid-community/react/lib/agGridReact';
import { Box, Group, Timeline, Text, ThemeIcon } from '@mantine/core';
import { RiSettings2Fill } from 'react-icons/ri';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { IderTrack, LibraryItem } from '/@/renderer/api/types';
import { Button, Popover, Spinner } from '/@/renderer/components';
import { usePlayQueueAdd } from '/@/renderer/features/player';
import { PlayButton } from '/@/renderer/features/shared';
import { LibraryBackgroundOverlay } from '/@/renderer/features/shared/components/library-background-overlay';
import { useCurrentServer, useCurrentTime } from '/@/renderer/store';
import {
    usePlayButtonBehavior,
    useRemoteSettings,
} from '/@/renderer/store/settings.store';
import { Play } from '/@/renderer/types';
import { useTrackList } from '/@/renderer/features/songs/queries/track-list-query';
import { useBeetTrack } from '/@/renderer/features/songs/queries/get-beet-id-query';
import { useContainerQuery } from '/@/renderer/hooks';
import { Link } from 'react-router-dom';


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

function timeFormat(duration: number): string {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
  
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
  
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
  
    return ret;
}

function getMapValue(map: Map<number, string[]>, key: number): string[] {
    return map.get(key) || [];
}


function makeTrackId(track: IderTrack): string {
    return `${track.artist}-${track.title}`
}

function getTrackNumber(curTime: number, startToTrackNumberMap: Map<number, number>): number {
    var startTime = 0
    for (const [endTime, trackNumber] of startToTrackNumberMap.entries()) {
        if (curTime >= startTime && curTime < endTime) {
            return trackNumber
        }
        startTime = endTime;
    }
    return 0
 }

export const MixInfoContent = ({ background }: MixInfoContentProps) => {
    const { songId } = useParams() as { songId: string };
    const server = useCurrentServer();
    const cq = useContainerQuery();
    const now = useCurrentTime();

    const beetTrack = useBeetTrack(
    {  
        options: {
            enabled: !!server?.username,
        },
        query: { id: songId, user: server?.username || ''},
        serverId: server?.id 
    }
    );
    console.log(`lajp beet track ${beetTrack.data?.results[0].id}`);
    const beetId = beetTrack.data?.results[0].id;
    const detailQuery = useTrackList(
    {
        options: {
            enabled: !!beetId,
        },
        query: { track_id: beetId || 0 },
        serverId: server?.id
    });
    const tracklist = detailQuery.data;

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

    const isLoading = detailQuery?.isLoading || beetTrack?.isLoading
    if (isLoading) return <ContentContainer ref={cq.ref} />;
    const trackList = tracklist!.items;

    const startToIdsMap: Map<number, string[]> = new Map();
    
    for (const track of trackList) {
        const ids = getMapValue(startToIdsMap, track.end);
        ids.push(makeTrackId(track));
        startToIdsMap.set((track.start, track.end), ids)
    }
    
    console.log(startToIdsMap);
    const startToTrackNumberMap: Map<number, number> = new Map();
    let prevValue = null;
    let trackNumber = 1;
    for (const [key, trackIds] of startToIdsMap.entries()) {
        for (const trackId of trackIds) {
            if (trackId != prevValue) {
                startToTrackNumberMap.set(key, trackNumber);
                prevValue = trackId;
                trackNumber++;
            } else {
               startToTrackNumberMap.set(key, trackNumber - 1);
            }
    
        }
    }
    console.log(`start to track map ${{startToTrackNumberMap}}`);
    var t = getTrackNumber(now, startToTrackNumberMap);
    console.log(`track number ${t} at time ${now}`);


    return (
        <ContentContainer ref={cq.ref}>
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
                  <Timeline active={getTrackNumber(now, startToTrackNumberMap)} bulletSize={24} lineWidth={1}>
                    {trackList.map((track) => (
                      <Timeline.Item
                        title={`${track.artist} - ${track.title}`}
                        //bullet={
                        //    <ThemeIcon
                        //        size={22}
                        //        variant="gradient"
                        //        gradient={{ from: 'lime', to: 'cyan' }}
                        //        radius="xl" children={undefined}                            ></ThemeIcon>
                        //}
                        >
                        <Text c="dimmed" size="sm">{timeFormat(track.start)} to {timeFormat(track.end)}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Box>
            </DetailContainer>
        </ContentContainer>
    );
};
