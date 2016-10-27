import { connect } from 'react-redux';
import Metrics from './metrics-component';
import { fetchMetrics } from '../../store/metrics-actions';

const mapStateToProps = (state) => {
    const globalCount = state.metrics.get('globalCount');
    const apps = state.metrics.get('apps').toArray();
    const clients = state.metrics.get('clients').toJS();

    const clientList = Object
        .keys(clients)
        .map((k) => {
            const client = clients[k];
            return {
                name: k,
                appName: client.appName,
                count: client.count,
                ping: new Date(client.ping),
            };
        })
        .sort((a, b) => (a.ping > b.ping ? -1 : 1));


    /*
        Possible stuff to ask/answer:
        * toggles in use but not in unleash-server
            * nr of toggles using fallbackValue
        * strategies implemented but not used
    */
    return {
        globalCount,
        apps,
        clientList,
    };
};

const MetricsContainer = connect(mapStateToProps, { fetchMetrics })(Metrics);

export default MetricsContainer;
