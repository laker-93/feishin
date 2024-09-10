import { DownloadContent } from '/@/renderer/features/download/components/download-content';
import { DownloadHeader } from '/@/renderer/features/download/components/download-header';
import { AnimatedPage } from '/@/renderer/features/shared';

const DownloadRoute = () => {
    return (
        <AnimatedPage>
            <DownloadHeader />
            <DownloadContent />
        </AnimatedPage>
    );
};

export default DownloadRoute;
