import 'whatwg-fetch';

import './app.css';

import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { StylesProvider } from '@material-ui/core/styles';

import mainTheme from './themes/main-theme';
import store from './store';
import MetricsPoller from './metrics-poller';
import App from './component/App';
import ScrollToTop from './component/scroll-to-top';
import { writeWarning } from './security-logger';

let composeEnhancers;

if (
    process.env.NODE_ENV !== 'production' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) {
    composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
} else {
    composeEnhancers = compose;
    writeWarning();
}

const unleashStore = createStore(
    store,
    composeEnhancers(applyMiddleware(thunkMiddleware))
);
const metricsPoller = new MetricsPoller(unleashStore);
metricsPoller.start();

ReactDOM.render(
    <Provider store={unleashStore}>
        <HashRouter>
            <ThemeProvider theme={mainTheme}>
                <StylesProvider injectFirst>
                    <CssBaseline />
                    <ScrollToTop>
                        <Route path="/" component={App} />
                    </ScrollToTop>
                </StylesProvider>
            </ThemeProvider>
        </HashRouter>
    </Provider>,
    document.getElementById('app')
);
