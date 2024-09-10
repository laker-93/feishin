import { UploadContent } from '/@/renderer/features/upload/components/upload-content';
import { UploadHeader } from '/@/renderer/features/upload/components/upload-header';
import { AnimatedPage } from '/@/renderer/features/shared';

const UploadRoute = () => {
    return (
        <AnimatedPage>
            <UploadHeader />
            <UploadContent />
        </AnimatedPage>
    );
};

export default UploadRoute;
