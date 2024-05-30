import { NativeScrollArea, Spinner } from '/@/renderer/components';
import { AnimatedPage, LibraryHeaderBar } from '/@/renderer/features/shared';
import { useRef } from 'react';
import type { AgGridReact as AgGridReactType } from '@ag-grid-community/react/lib/agGridReact';
import { useParams } from 'react-router';
import { useFastAverageColor } from '/@/renderer/hooks';
import { usePlayQueueAdd } from '/@/renderer/features/player';
import { usePlayButtonBehavior } from '/@/renderer/store/settings.store';
import { LibraryItem } from '/@/renderer/api/types';
import { useCurrentServer } from '/@/renderer/store';
import { useSongInfo } from '/@/renderer/features/songs/queries/song-info-query';
import { SongInfoHeader } from '/@/renderer/features/songs/components/song-info-header';
import { SongInfoContent } from '/@/renderer/features/songs/components/song-info-content';

const SongInfoRoute = () => {
    const tableRef = useRef<AgGridReactType | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const { songId } = useParams() as { songId: string };
    const server = useCurrentServer();
    const detailQuery = useSongInfo({ query: { id: songId }, serverId: server?.id });
    const { color: background, colorId } = useFastAverageColor({
        id: songId,
        src: detailQuery.data?.imageUrl,
        srcLoaded: !detailQuery.isLoading,
    });

    const handlePlayQueueAdd = usePlayQueueAdd();
    const playButtonBehavior = usePlayButtonBehavior();




    const handlePlay = () => {
        handlePlayQueueAdd?.({
            byItemType: {
                id: [songId],
                type: LibraryItem.SONG,
            },
            playType: playButtonBehavior,
        });
    };

    if (!background || colorId !== songId) {
        return <Spinner container />;
    }

    return (
        <AnimatedPage key={`song-info-${songId}`}>
            <NativeScrollArea
                ref={scrollAreaRef}
                pageHeaderProps={{
                    backgroundColor: background,
                    children: (
                        <LibraryHeaderBar>
                            <LibraryHeaderBar.PlayButton onClick={handlePlay} />
                            <LibraryHeaderBar.Title>
                                {detailQuery?.data?.name}
                            </LibraryHeaderBar.Title>
                        </LibraryHeaderBar>
                    ),
                    offset: 200,
                    target: headerRef,
                }}
            >
                <SongInfoHeader
                    ref={headerRef}
                    background={background}
                />
                <SongInfoContent
                    background={background}
                    tableRef={tableRef}
                />

            </NativeScrollArea>
        </AnimatedPage>
    );
};

export default SongInfoRoute;
