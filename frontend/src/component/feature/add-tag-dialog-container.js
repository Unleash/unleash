import { connect } from 'react-redux';
import AddTagDialogComponent from './add-tag-dialog-component';

import { tagFeature } from '../../store/feature-tags/actions';

const mapStateToProps = () => ({
    tag: { type: 'simple', value: '' },
});

const mapDispatchToProps = dispatch => ({
    submit: (featureToggleName, tag) => tagFeature(featureToggleName, tag)(dispatch),
});

const AddTagDialogContainer = connect(mapStateToProps, mapDispatchToProps)(AddTagDialogComponent);

export default AddTagDialogContainer;
