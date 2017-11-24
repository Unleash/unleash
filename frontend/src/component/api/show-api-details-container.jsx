import { connect } from 'react-redux';
import ShowApiDetailsComponent from './show-api-details-component';
import { fetchAll } from '../../store/api/actions';

const mapDispatchToProps = {
    fetchAll,
};

const mapStateToProps = state => ({
    apiDetails: state.api.toJS(),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowApiDetailsComponent);
