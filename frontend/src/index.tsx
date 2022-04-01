import 'whatwg-fetch';
import 'themes/app.css';

import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StylesProvider } from '@material-ui/core/styles';
import mainTheme from 'themes/mainTheme';
import { App } from 'component/App';
import { ScrollTop } from 'component/common/ScrollTop/ScrollTop';
import AccessProvider from 'component/providers/AccessProvider/AccessProvider';
import { getBasePath } from 'utils/formatPath';
import { FeedbackCESProvider } from 'component/feedback/FeedbackCESContext/FeedbackCESProvider';
import UIProvider from 'component/providers/UIProvider/UIProvider';

ReactDOM.render(
    <DndProvider backend={HTML5Backend}>
        <UIProvider>
            <AccessProvider>
                <Router basename={`${getBasePath()}`}>
                    <ThemeProvider theme={mainTheme}>
                        <StylesProvider injectFirst>
                            <FeedbackCESProvider>
                                <CssBaseline />
                                <ScrollTop />
                                <Route path="/" component={App} />
                            </FeedbackCESProvider>
                        </StylesProvider>
                    </ThemeProvider>
                </Router>
            </AccessProvider>
        </UIProvider>
    </DndProvider>,
    document.getElementById('app')
);
