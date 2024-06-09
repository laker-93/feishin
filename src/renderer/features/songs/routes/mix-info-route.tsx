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
import { MixInfoContent } from '/@/renderer/features/songs/components/mix-info-content';

const MixInfoRoute = () => {
    const tableRef = useRef<AgGridReactType | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const { id } = useParams() as { id: string };
    const detailQuery = useSongInfo({ query: { id: id } });


    const handlePlayQueueAdd = usePlayQueueAdd();
    const playButtonBehavior = usePlayButtonBehavior();
    const background = 'var(--modal-bg)';




    const handlePlay = () => {
        handlePlayQueueAdd?.({
            byItemType: {
                id: [id],
                type: LibraryItem.SONG,
            },
            playType: playButtonBehavior,
        });
    };


    return (
        <AnimatedPage key={`song-info-${id}`}>
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
                <MixInfoContent
                    background={background}
                    tableRef={tableRef}
                />

            </NativeScrollArea>
        </AnimatedPage>
    );
};

export default MixInfoRoute;
