import { useQuery } from '@tanstack/react-query';
import type { TrackListQuery } from '/@/renderer/api/types';
import { iderController } from '/@/renderer/api/ider/ider-controller';

export const useTrackList = (args: TrackListQuery) => {
    const { track_id } = args;

    return useQuery({
        queryFn: ({ signal }) => {
            return iderController.getTrackList({ query: track_id });
        },
        queryKey: ['track_id'],
    });
};
