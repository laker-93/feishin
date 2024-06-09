import {
    TrackListArgs,
    TrackListResponse,
} from '../types';
import { iderApiClient } from '/@/renderer/api/ider/ider-api';

const getTrackList = async (args: TrackListArgs): Promise<TrackListResponse> => {
    const { query } = args;
    console.log(`lajp query ${query}`);

    const res = await iderApiClient({url: "http://localhost:8001"}).getTrackList({
        query: {
            track_id: query
        },
    });

    if (res.status !== 200) {
        throw new Error('Failed to get track list');
    }

    return {
        items: res.body.data,
        startIndex: 0,
        totalRecordCount: Number(res.body.headers.get('x-total-count') || 0),
    };
};

export const iderController = {
    getTrackList,
};
