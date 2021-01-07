import { connect } from 'react-redux';
import TagComponent from './form-tag-component';
import { create } from '../../store/tag/actions';

const mapStateToProps = () => ({
    tag: { type: '', value: '' },
});

const mapDispatchToProps = dispatch => ({
    submit: tag => create(tag)(dispatch),
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(TagComponent);

export default FormAddContainer;
