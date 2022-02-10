import { connect } from 'react-redux';
import { App } from './App';
import { fetchUiBootstrap } from '../store/ui-bootstrap/actions';

export default connect(null, { fetchUiBootstrap })(App);
