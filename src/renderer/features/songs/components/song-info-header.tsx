import { Group, Stack } from '@mantine/core';
import { forwardRef, Fragment, Ref } from 'react';
import { generatePath, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { LibraryItem, ServerType } from '/@/renderer/api/types';
import { Rating, Text } from '/@/renderer/components';
import { LibraryHeader, useSetRating } from '/@/renderer/features/shared';
import { useContainerQuery } from '/@/renderer/hooks';
import { AppRoute } from '/@/renderer/router/routes';
import { useCurrentServer } from '/@/renderer/store';
import { formatDurationString } from '/@/renderer/utils';
import { useSongInfo } from '/@/renderer/features/songs/queries/song-info-query';

interface SongInfoHeaderProps {
    background: string;
}

export const SongInfoHeader = forwardRef(
    ({ background }: SongInfoHeaderProps, ref: Ref<HTMLDivElement>) => {
        const { albumId } = useParams() as { albumId: string };
        const server = useCurrentServer();
        const detailQuery = useSongInfo({ query: { id: albumId }, serverId: server?.id });
        const cq = useContainerQuery();

        const metadataItems = [
            {
                id: 'releaseYear',
                secondary: false,
                value: detailQuery?.data?.releaseYear,
            },
            {
                id: 'duration',
                secondary: false,
                value:
                    detailQuery?.data?.duration && formatDurationString(detailQuery.data.duration),
            },
        ];

        const updateRatingMutation = useSetRating({});

        const handleUpdateRating = (rating: number) => {
            if (!detailQuery?.data) return;

            updateRatingMutation.mutate({
                query: {
                    item: [detailQuery.data],
                    rating,
                },
                serverId: detailQuery.data.serverId,
            });
        };

        const showRating = detailQuery?.data?.serverType === ServerType.NAVIDROME;

        return (
            <Stack ref={cq.ref}>
                <LibraryHeader
                    ref={ref}
                    background={background}
                    imageUrl={detailQuery?.data?.imageUrl}
                    item={{ route: AppRoute.LIBRARY_SONGS, type: LibraryItem.SONG }}
                    title={detailQuery?.data?.name || ''}
                >
                    <Stack spacing="sm">
                        <Group spacing="sm">
                            {metadataItems.map((item, index) => (
                                <Fragment key={`item-${item.id}-${index}`}>
                                    {index > 0 && <Text $noSelect>•</Text>}
                                    <Text $secondary={item.secondary}>{item.value}</Text>
                                </Fragment>
                            ))}
                            {showRating && (
                                <>
                                    <Text $noSelect>•</Text>
                                    <Rating
                                        readOnly={
                                            detailQuery?.isFetching ||
                                            updateRatingMutation.isLoading
                                        }
                                        value={detailQuery?.data?.userRating || 0}
                                        onChange={handleUpdateRating}
                                    />
                                </>
                            )}
                        </Group>
                        <Group
                            mah="4rem"
                            spacing="md"
                            sx={{
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {detailQuery?.data?.albumArtists.map((artist) => (
                                <Text
                                    key={`artist-${artist.id}`}
                                    $link
                                    component={Link}
                                    fw={600}
                                    size="md"
                                    to={generatePath(AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL, {
                                        albumArtistId: artist.id,
                                    })}
                                    variant="subtle"
                                >
                                    {artist.name}
                                </Text>
                            ))}
                        </Group>
                    </Stack>
                </LibraryHeader>
            </Stack>
        );
    },
);
