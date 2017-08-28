import { connect } from 'react-redux';
import ApplicationList from './application-list-component';
import { fetchAll } from '../../store/application/actions';

const mapStateToProps = state => ({
    applications: state.applications.get('list').toJS(),
});

const Container = connect(mapStateToProps, { fetchAll })(ApplicationList);

export default Container;
