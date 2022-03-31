import 'whatwg-fetch';
import './app.css';

import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StylesProvider } from '@material-ui/core/styles';
import mainTheme from 'themes/mainTheme';
import { App } from './component/App';
import ScrollToTop from 'component/scrollToTop';
import AccessProvider from './component/providers/AccessProvider/AccessProvider';
import { getBasePath } from 'utils/formatPath';
import UIProvider from './component/providers/UIProvider/UIProvider';
import { FeedbackCESProvider } from 'component/feedback/FeedbackCESContext/FeedbackCESProvider';

ReactDOM.render(
    <DndProvider backend={HTML5Backend}>
        <UIProvider>
            <AccessProvider>
                <Router basename={`${getBasePath()}`}>
                    <ThemeProvider theme={mainTheme}>
                        <StylesProvider injectFirst>
                            <FeedbackCESProvider>
                                <CssBaseline />
                                <ScrollToTop>
                                    <Route path="/" component={App} />
                                </ScrollToTop>
                            </FeedbackCESProvider>
                        </StylesProvider>
                    </ThemeProvider>
                </Router>
            </AccessProvider>
        </UIProvider>
    </DndProvider>,
    document.getElementById('app')
);
