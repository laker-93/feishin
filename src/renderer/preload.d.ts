import { IpcRendererEvent } from 'electron';
import { PlayerData, PlayerState } from './store';
import { FontData, InternetProviderLyricResponse, QueueSong } from '/@/renderer/api/types';
import { Remote } from '/@/main/preload/remote';
import { Mpris } from '/@/main/preload/mpris';
import { MpvPLayer, MpvPlayerListener } from '/@/main/preload/mpv-player';
import { Lyrics } from '/@/main/preload/lyrics';
import { Utils } from '/@/main/preload/utils';
import { LocalSettings } from '/@/main/preload/local-settings';
import { Ipc } from '/@/main/preload/ipc';
import { DiscordRpc } from '/@/main/preload/discord-rpc';
import { Browser } from '/@/main/preload/browser';
import { UserFS } from '/@/main/preload/user-fs';

declare global {
    interface Window {
        SERVER_LOCK?: boolean;
        SERVER_NAME?: string;
        SERVER_TYPE?: string;
        SERVER_URL?: string;
        electron: {
            browser: Browser;
            discordRpc: DiscordRpc;
            ipc?: Ipc;
            ipcRenderer: {
                APP_RESTART(): void;
                LYRIC_FETCH(data: QueueSong): void;
                LYRIC_GET(
                    event: IpcRendererEvent,
                    songName: string,
                    source: string,
                    lyric: InternetProviderLyricResponse,
                ): void;
                PASSWORD_GET(server: string): Promise<string | null>;
                PASSWORD_REMOVE(server: string): void;
                PASSWORD_SET(password: string, server: string): Promise<boolean>;
                PLAYER_AUTO_NEXT(data: PlayerData): void;
                PLAYER_CURRENT_TIME(): void;
                PLAYER_GET_TIME(): number | undefined;
                PLAYER_MEDIA_KEYS_DISABLE(): void;
                PLAYER_MEDIA_KEYS_ENABLE(): void;
                PLAYER_MUTE(): void;
                PLAYER_NEXT(): void;
                PLAYER_PAUSE(): void;
                PLAYER_PLAY(): void;
                PLAYER_PREVIOUS(): void;
                PLAYER_RESTORE_DATA(): void;
                PLAYER_SAVE_QUEUE(data: PlayerState): void;
                PLAYER_SEEK(seconds: number): void;
                PLAYER_SEEK_TO(seconds: number): void;
                PLAYER_SET_QUEUE(data: PlayerData): void;
                PLAYER_SET_QUEUE_NEXT(data: PlayerData): void;
                PLAYER_STOP(): void;
                PLAYER_VOLUME(value: number): void;
                REMOTE_ENABLE(enabled: boolean): Promise<string | null>;
                REMOTE_PORT(port: number): Promise<string | null>;
                RENDERER_PLAYER_AUTO_NEXT(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_CURRENT_TIME(
                    cb: (event: IpcRendererEvent, data: any) => void,
                ): void;
                RENDERER_PLAYER_NEXT(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_PAUSE(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_PLAY(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_PLAY_PAUSE(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_PREVIOUS(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_RESTORE_QUEUE(
                    cb: (event: IpcRendererEvent, data: any) => void,
                ): void;
                RENDERER_PLAYER_SAVE_QUEUE(cb: (event: IpcRendererEvent, data: any) => void): void;
                RENDERER_PLAYER_STOP(cb: (event: IpcRendererEvent, data: any) => void): void;
                SETTINGS_GET(data: { property: string }): any;
                SETTINGS_SET(data: { property: string; value: any }): void;
                removeAllListeners(value: string): void;
                windowClose(): void;
                windowMaximize(): void;
                windowMinimize(): void;
                windowUnmaximize(): void;
            };
            localSettings: LocalSettings;
            lyrics?: Lyrics;
            mpris?: Mpris;
            mpvPlayer?: MpvPLayer;
            mpvPlayerListener?: MpvPlayerListener;
            remote?: Remote;
            userFs?: UserFS;
            utils?: Utils;
        };
        queryLocalFonts?: () => Promise<FontData[]>;
    }
}

export {};
