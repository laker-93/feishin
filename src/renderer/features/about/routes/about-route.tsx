import { ListContext } from "/@/renderer/context/list-context";
import { AboutContent } from "/@/renderer/features/about/components/about-content";
import { AboutHeader } from "/@/renderer/features/about/components/about-header";
import { AnimatedPage } from "/@/renderer/features/shared";


const AboutRoute = () => {

    return (
        <AnimatedPage>
            <ListContext.Provider value={}>
                <AboutHeader/>
                <AboutContent/>
            </ListContext.Provider>
        </AnimatedPage>
    );
};

export default AboutRoute;
