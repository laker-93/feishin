import { lazy, Suspense } from 'react';
import { Route, HashRouter, Routes } from 'react-router-dom';
import { AppRoute } from './routes';
import { DefaultLayout } from '/@/renderer/layouts';
import { AppOutlet } from '/@/renderer/router/app-outlet';
import { TitlebarOutlet } from '/@/renderer/router/titlebar-outlet';
import { ModalsProvider } from '@mantine/modals';
import { BaseContextModal } from '/@/renderer/components';
import { AddToPlaylistContextModal } from '/@/renderer/features/playlists';
import { ShareItemContextModal } from '/@/renderer/features/sharing';
import { DeleteSongContextModal } from '/@/renderer/features/songs/delete-song-context-modal';

const NowPlayingRoute = lazy(
    () => import('/@/renderer/features/now-playing/routes/now-playing-route'),
);

const AlbumListRoute = lazy(() => import('/@/renderer/features/albums/routes/album-list-route'));

const SongListRoute = lazy(() => import('/@/renderer/features/songs/routes/song-list-route'));

const MixListRoute = lazy(() => import('/@/renderer/features/mixes/routes/mix-list-route'));

const PlaylistDetailSongListRoute = lazy(
    () => import('/@/renderer/features/playlists/routes/playlist-detail-song-list-route'),
);

const PlaylistListRoute = lazy(
    () => import('/@/renderer/features/playlists/routes/playlist-list-route'),
);

const ActionRequiredRoute = lazy(
    () => import('/@/renderer/features/action-required/routes/action-required-route'),
);

const InvalidRoute = lazy(
    () => import('/@/renderer/features/action-required/routes/invalid-route'),
);

const AboutRoute = lazy(() => import('/@/renderer/features/about/routes/about-route'));
const DownloadRoute = lazy(() => import('/@/renderer/features/download/routes/download-route'));
const UploadRoute = lazy(() => import('/@/renderer/features/upload/routes/upload-route'));

const HomeRoute = lazy(() => import('/@/renderer/features/home/routes/home-route'));

const AlbumArtistListRoute = lazy(
    () => import('/@/renderer/features/artists/routes/album-artist-list-route'),
);

const AlbumArtistDetailRoute = lazy(
    () => import('/@/renderer/features/artists/routes/album-artist-detail-route'),
);

const AlbumArtistDetailTopSongsListRoute = lazy(
    () => import('../features/artists/routes/album-artist-detail-top-songs-list-route'),
);

const AlbumDetailRoute = lazy(
    () => import('/@/renderer/features/albums/routes/album-detail-route'),
);

const MixInfoRoute = lazy(() => import('/@/renderer/features/mixes/routes/mix-info-route'));
const DummyAlbumDetailRoute = lazy(
    () => import('/@/renderer/features/albums/routes/dummy-album-detail-route'),
);

const GenreListRoute = lazy(() => import('/@/renderer/features/genres/routes/genre-list-route'));

const SettingsRoute = lazy(() => import('/@/renderer/features/settings/routes/settings-route'));

const SearchRoute = lazy(() => import('/@/renderer/features/search/routes/search-route'));

const RouteErrorBoundary = lazy(
    () => import('/@/renderer/features/action-required/components/route-error-boundary'),
);

export const AppRouter = () => {
    const router = (
        <HashRouter future={{ v7_startTransition: true }}>
            <ModalsProvider
                modalProps={{
                    centered: true,
                    styles: {
                        body: { position: 'relative' },
                        content: { overflow: 'auto' },
                    },
                    transitionProps: {
                        duration: 300,
                        exitDuration: 300,
                        transition: 'fade',
                    },
                }}
                modals={{
                    addToPlaylist: AddToPlaylistContextModal,
                    base: BaseContextModal,
                    deleteSong: DeleteSongContextModal,
                    shareItem: ShareItemContextModal,
                }}
            >
                <Routes>
                    <Route element={<TitlebarOutlet />}>
                        <Route
                            element={<AppOutlet />}
                            errorElement={<RouteErrorBoundary />}
                        >
                            <Route element={<DefaultLayout />}>
                                <Route
                                    index
                                    element={<HomeRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                />
                                <Route
                                    element={<HomeRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.HOME}
                                />
                                <Route
                                    element={<AboutRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.ABOUT}
                                />
                                <Route
                                    element={<DownloadRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.DOWNLOAD}
                                />
                                <Route
                                    element={<UploadRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.UPLOAD}
                                />
                                <Route
                                    element={<SearchRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.SEARCH}
                                />
                                <Route
                                    element={<SettingsRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.SETTINGS}
                                />
                                <Route
                                    element={<NowPlayingRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.NOW_PLAYING}
                                />
                                <Route path={AppRoute.LIBRARY_GENRES}>
                                    <Route
                                        index
                                        element={<GenreListRoute />}
                                        errorElement={<RouteErrorBoundary />}
                                    />
                                    <Route
                                        element={<AlbumListRoute />}
                                        path={AppRoute.LIBRARY_GENRES_ALBUMS}
                                    />
                                    <Route
                                        element={<SongListRoute />}
                                        path={AppRoute.LIBRARY_GENRES_SONGS}
                                    />
                                </Route>
                                <Route
                                    element={<AlbumListRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_ALBUMS}
                                />
                                <Route
                                    element={<AlbumDetailRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_ALBUMS_DETAIL}
                                />
                                <Route
                                    element={<MixInfoRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_MIX_INFO}
                                />
                                <Route
                                    element={<DummyAlbumDetailRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.FAKE_LIBRARY_ALBUM_DETAILS}
                                />
                                <Route
                                    element={<SongListRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_SONGS}
                                />
                                <Route
                                    element={<MixListRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_MIXES}
                                />
                                <Route
                                    element={<PlaylistListRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.PLAYLISTS}
                                />
                                <Route
                                    element={<PlaylistDetailSongListRoute />}
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.PLAYLISTS_DETAIL_SONGS}
                                />
                                <Route
                                    errorElement={<RouteErrorBoundary />}
                                    path={AppRoute.LIBRARY_ALBUM_ARTISTS}
                                >
                                    <Route
                                        index
                                        element={<AlbumArtistListRoute />}
                                    />
                                    <Route path={AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL}>
                                        <Route
                                            index
                                            element={<AlbumArtistDetailRoute />}
                                        />
                                        <Route
                                            element={<AlbumListRoute />}
                                            path={AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL_DISCOGRAPHY}
                                        />
                                        <Route
                                            element={<SongListRoute />}
                                            path={AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL_SONGS}
                                        />
                                        <Route
                                            element={<AlbumArtistDetailTopSongsListRoute />}
                                            path={AppRoute.LIBRARY_ALBUM_ARTISTS_DETAIL_TOP_SONGS}
                                        />
                                    </Route>
                                </Route>
                                <Route
                                    element={<InvalidRoute />}
                                    path="*"
                                />
                            </Route>
                        </Route>
                    </Route>
                    <Route element={<TitlebarOutlet />}>
                        <Route element={<DefaultLayout shell />}>
                            <Route
                                element={<ActionRequiredRoute />}
                                path={AppRoute.ACTION_REQUIRED}
                            />
                        </Route>
                    </Route>
                </Routes>
            </ModalsProvider>
        </HashRouter>
    );

    return <Suspense fallback={<></>}>{router}</Suspense>;
};
