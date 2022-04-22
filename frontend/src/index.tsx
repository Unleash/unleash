import 'whatwg-fetch';
import 'themes/app.css';

import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MainThemeProvider } from 'themes/MainThemeProvider';
import { App } from 'component/App';
import { ScrollTop } from 'component/common/ScrollTop/ScrollTop';
import AccessProvider from 'component/providers/AccessProvider/AccessProvider';
import { getBasePath } from 'utils/formatPath';
import { FeedbackCESProvider } from 'component/feedback/FeedbackCESContext/FeedbackCESProvider';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

ReactDOM.render(
    <DndProvider backend={HTML5Backend}>
        <UIProvider>
            <AccessProvider>
                <Router basename={`${getBasePath()}`}>
                    <MainThemeProvider>
                        <AnnouncerProvider>
                            <FeedbackCESProvider>
                                <ScrollTop />
                                <Route path="/" component={App} />
                            </FeedbackCESProvider>
                        </AnnouncerProvider>
                    </MainThemeProvider>
                </Router>
            </AccessProvider>
        </UIProvider>
    </DndProvider>,
    document.getElementById('app')
);
