import { MutableRefObject, useCallback, useEffect } from 'react';
import type { AgGridReact as AgGridReactType } from '@ag-grid-community/react/lib/agGridReact';
import { Box, Group, Stack, Timeline, Text } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { FaLastfmSquare } from 'react-icons/fa';
import { RiHeartFill, RiHeartLine, RiMoreFill, RiSettings2Fill } from 'react-icons/ri';
import { SiMusicbrainz } from 'react-icons/si';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { queryKeys } from '/@/renderer/api/query-keys';
import { AlbumListSort, LibraryItem, SortOrder } from '/@/renderer/api/types';
import { Button, Popover, Spoiler } from '/@/renderer/components';
import { MemoizedSwiperGridCarousel } from '/@/renderer/components/grid-carousel';
import { useAlbumList } from '/@/renderer/features/albums/queries/album-list-query';
import {
    useHandleGeneralContextMenu,
} from '/@/renderer/features/context-menu';
import {
    ALBUM_CONTEXT_MENU_ITEMS,
} from '/@/renderer/features/context-menu/context-menu-items';
import { usePlayQueueAdd } from '/@/renderer/features/player';
import { PlayButton, useCreateFavorite, useDeleteFavorite } from '/@/renderer/features/shared';
import { LibraryBackgroundOverlay } from '/@/renderer/features/shared/components/library-background-overlay';
import { useContainerQuery } from '/@/renderer/hooks';
import { AppRoute } from '/@/renderer/router/routes';
import { useCurrentServer, useCurrentTime } from '/@/renderer/store';
import {
    useGeneralSettings,
    usePlayButtonBehavior,
    useSettingsStoreActions,
} from '/@/renderer/store/settings.store';
import { Play } from '/@/renderer/types';
import { replaceURLWithHTMLLinks } from '/@/renderer/utils/linkify';
import { useSongInfo } from '/@/renderer/features/songs/queries/song-info-query';
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

interface SongInfoContentProps {
    background?: string;
    tableRef: MutableRefObject<AgGridReactType | null>;
}

export const SongInfoContent = ({ background }: SongInfoContentProps) => {
    const { t } = useTranslation();
    const { songId } = useParams() as { songId: string };
    const server = useCurrentServer();
    const detailQuery = useSongInfo({ query: { id: songId } });

    const cq = useContainerQuery();
    const handlePlayQueueAdd = usePlayQueueAdd();
    const { setTable } = useSettingsStoreActions();
    const { externalLinks } = useGeneralSettings();

    const [pagination, setPagination] = useSetState({
        artist: 0,
    });

    // const [currentTime, setCurrentTime] = useState(0);

    const handleNextPage = useCallback(
        (key: 'artist') => {
            setPagination({
                [key]: pagination[key as keyof typeof pagination] + 1,
            });
        },
        [pagination, setPagination],
    );

    const handlePreviousPage = useCallback(
        (key: 'artist') => {
            setPagination({
                [key]: pagination[key as keyof typeof pagination] - 1,
            });
        },
        [pagination, setPagination],
    );

    const artistQuery = useAlbumList({
        options: {
            cacheTime: 1000 * 60,
            enabled: detailQuery?.data?.albumArtists[0]?.id !== undefined,
            keepPreviousData: true,
            staleTime: 1000 * 60,
        },
        query: {
            _custom: {
                jellyfin: {
                    AlbumArtistIds: detailQuery?.data?.albumArtists[0]?.id,
                    ExcludeItemIds: detailQuery?.data?.id,
                },
                navidrome: {
                    artist_id: detailQuery?.data?.albumArtists[0]?.id,
                },
            },
            limit: 15,
            sortBy: AlbumListSort.YEAR,
            sortOrder: SortOrder.DESC,
            startIndex: 0,
        },
        serverId: server?.id,
    });

    const relatedAlbumGenresRequest = {
        _custom: {
            jellyfin: {
                GenreIds: detailQuery?.data?.genres?.[0]?.id,
            },
            navidrome: {
                genre_id: detailQuery?.data?.genres?.[0]?.id,
            },
        },
        limit: 15,
        sortBy: AlbumListSort.RANDOM,
        sortOrder: SortOrder.ASC,
        startIndex: 0,
    };

    const relatedAlbumGenresQuery = useAlbumList({
        options: {
            cacheTime: 1000 * 60,
            enabled: !!detailQuery?.data?.genres?.[0],
            queryKey: queryKeys.albums.related(
                server?.id || '',
                songId,
                relatedAlbumGenresRequest,
            ),
            staleTime: 1000 * 60,
        },
        query: relatedAlbumGenresRequest,
        serverId: server?.id,
    });




    const carousels = [
        {
            data: artistQuery?.data?.items.filter((a) => a.id !== detailQuery?.data?.id),
            isHidden: !artistQuery?.data?.items.filter((a) => a.id !== detailQuery?.data?.id)
                .length,
            loading: artistQuery?.isLoading || artistQuery.isFetching,
            pagination: {
                handleNextPage: () => handleNextPage('artist'),
                handlePreviousPage: () => handlePreviousPage('artist'),
                hasPreviousPage: pagination.artist > 0,
            },
            title: t('page.albumDetail.moreFromArtist', { postProcess: 'sentenceCase' }),
            uniqueId: 'mostPlayed',
        },
        {
            data: relatedAlbumGenresQuery?.data?.items.filter(
                (a) => a.id !== detailQuery?.data?.id,
            ),
            isHidden: !relatedAlbumGenresQuery?.data?.items.filter(
                (a) => a.id !== detailQuery?.data?.id,
            ).length,
            loading: relatedAlbumGenresQuery?.isLoading || relatedAlbumGenresQuery.isFetching,
            title: t('page.albumDetail.moreFromGeneric', {
                item: detailQuery?.data?.genres?.[0]?.name,
                postProcess: 'sentenceCase',
            }),
            uniqueId: 'relatedGenres',
        },
    ];
    const playButtonBehavior = usePlayButtonBehavior();

    const handlePlay = async (playType?: Play) => {
        handlePlayQueueAdd?.({
            byItemType: {id: [songId], type: LibraryItem.SONG},
            playType: playType || playButtonBehavior,
        });
    };


    const createFavoriteMutation = useCreateFavorite({});
    const deleteFavoriteMutation = useDeleteFavorite({});

    const handleFavorite = () => {
        if (!detailQuery?.data) return;

        if (detailQuery.data.userFavorite) {
            deleteFavoriteMutation.mutate({
                query: {
                    id: [detailQuery.data.id],
                    type: LibraryItem.ALBUM,
                },
                serverId: detailQuery.data.serverId,
            });
        } else {
            createFavoriteMutation.mutate({
                query: {
                    id: [detailQuery.data.id],
                    type: LibraryItem.ALBUM,
                },
                serverId: detailQuery.data.serverId,
            });
        }
    };

    const comment = detailQuery?.data?.comment;

    const handleGeneralContextMenu = useHandleGeneralContextMenu(
        LibraryItem.ALBUM,
        ALBUM_CONTEXT_MENU_ITEMS,
    );

    const mbzId = detailQuery?.data?.mbzId;

    const now = useCurrentTime();

    useEffect(() => {
        console.log(`lajp got time ${now}`);
    }, [now]);


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
                            <Button
                                compact
                                loading={
                                    createFavoriteMutation.isLoading ||
                                    deleteFavoriteMutation.isLoading
                                }
                                variant="subtle"
                                onClick={handleFavorite}
                            >
                                {detailQuery?.data?.userFavorite ? (
                                    <RiHeartFill
                                        color="red"
                                        size={20}
                                    />
                                ) : (
                                    <RiHeartLine size={20} />
                                )}
                            </Button>
                            <Button
                                compact
                                variant="subtle"
                                onClick={(e) => {
                                    if (!detailQuery?.data) return;
                                    handleGeneralContextMenu(e, [detailQuery.data!]);
                                }}
                            >
                                <RiMoreFill size={20} />
                            </Button>
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

                {externalLinks ? (
                    <Box component="section">
                        <Group spacing="sm">
                            <Button
                                compact
                                component="a"
                                href={`https://www.last.fm/music/${encodeURIComponent(
                                    detailQuery?.data?.albumArtist || '',
                                )}/${encodeURIComponent(detailQuery.data?.name || '')}`}
                                radius="md"
                                rel="noopener noreferrer"
                                size="md"
                                target="_blank"
                                tooltip={{
                                    label: t('action.openIn.lastfm'),
                                }}
                                variant="subtle"
                            >
                                <FaLastfmSquare size={25} />
                            </Button>
                            {mbzId ? (
                                <Button
                                    compact
                                    component="a"
                                    href={`https://musicbrainz.org/release/${mbzId}`}
                                    radius="md"
                                    rel="noopener noreferrer"
                                    size="md"
                                    target="_blank"
                                    tooltip={{
                                        label: t('action.openIn.musicbrainz'),
                                    }}
                                    variant="subtle"
                                >
                                    <SiMusicbrainz size={25} />
                                </Button>
                            ) : null}
                        </Group>
                    </Box>
                ) : null}
                {comment && (
                    <Box component="section">
                        <Spoiler maxHeight={75}>{replaceURLWithHTMLLinks(comment)}</Spoiler>
                    </Box>
                )}
                <Box style={{ minHeight: '300px' }}>
                  <Timeline active={1} bulletSize={24} lineWidth={2}>
                    <Timeline.Item title="New branch">
                      <Text c="dimmed" size="sm">You&apos;ve created new branch {now} <Text variant="link" component="span" inherit>fix-notifications</Text> from master</Text>
                      <Text size="xs" mt={4}>2 hours ago</Text>
                    </Timeline.Item>
    
                    <Timeline.Item title="Commits">
                      <Text c="dimmed" size="sm">You&apos;ve pushed 23 commits to<Text variant="link" component="span" inherit>fix-notifications branch</Text></Text>
                      <Text size="xs" mt={4}>52 minutes ago</Text>
                    </Timeline.Item>
    
                    <Timeline.Item title="Pull request" lineVariant="dashed">
                      <Text c="dimmed" size="sm">You&apos;ve submitted a pull request<Text variant="link" component="span" inherit>Fix incorrect notification message (#187)</Text></Text>
                      <Text size="xs" mt={4}>34 minutes ago</Text>
                    </Timeline.Item>
    
                    <Timeline.Item title="Code review">
                      <Text c="dimmed" size="sm"><Text variant="link" component="span" inherit>Robert Gluesticker</Text> left a code review on your pull request</Text>
                      <Text size="xs" mt={4}>12 minutes ago</Text>
                    </Timeline.Item>
                  </Timeline>
                </Box>
                <Stack
                    ref={cq.ref}
                    mt="3rem"
                    spacing="lg"
                >
                    {cq.height || cq.width ? (
                        <>
                            {carousels
                                .filter((c) => !c.isHidden)
                                .map((carousel, index) => (
                                    <MemoizedSwiperGridCarousel
                                        key={`carousel-${carousel.uniqueId}-${index}`}
                                        cardRows={[
                                            {
                                                property: 'name',
                                                route: {
                                                    route: AppRoute.LIBRARY_ALBUMS_DETAIL,
                                                    slugs: [
                                                        {
                                                            idProperty: 'id',
                                                            slugProperty: 'albumId',
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                arrayProperty: 'name',
                                                property: 'albumArtists',
                                                route: {
                                                    route: AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL,
                                                    slugs: [
                                                        {
                                                            idProperty: 'id',
                                                            slugProperty: 'albumArtistId',
                                                        },
                                                    ],
                                                },
                                            },
                                        ]}
                                        data={carousel.data}
                                        isLoading={carousel.loading}
                                        itemType={LibraryItem.ALBUM}
                                        route={{
                                            route: AppRoute.LIBRARY_ALBUMS_DETAIL,
                                            slugs: [{ idProperty: 'id', slugProperty: 'albumId' }],
                                        }}
                                        title={{
                                            label: carousel.title,
                                        }}
                                        uniqueId={carousel.uniqueId}
                                    />
                                ))}
                        </>
                    ) : null}
                </Stack>
            </DetailContainer>
        </ContentContainer>
    );
};
