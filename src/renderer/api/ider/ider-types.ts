import { z } from 'zod';

const error = z.string();
const track = z.object({
    track_id: z.number(),
    start: z.number(),
    end: z.number(),
    mbid: z.string(),
    artist: z.string(),
    title: z.string(),
});

const trackList = z.array(track);

const segmentIdParameters = z.object({
    track_id: z.number(),
    time: z.number(),
});

const trackListParameters = z.object({
    track_id: z.number(),
});

export const iderType = {
    _parameters: {
        trackList: trackListParameters,
    },
    _response: {
        trackList,
        error
    },
};

