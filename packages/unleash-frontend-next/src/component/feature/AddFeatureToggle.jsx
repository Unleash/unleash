import { React, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addFeatureToggle } from '../../store/actions';


let AddFeatureToggle = ({ dispatch }) => {
    let input;

    return (
    <div>
      <form onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
              return;
          }
          dispatch(addFeatureToggle(input.value));
          input.value = '';
      }}>
        <input ref={node => {
            input = node;
        }} />
        <button type="submit">
          Add Feature Toggle.
        </button>
      </form>
    </div>
  );
};
AddFeatureToggle = connect()(AddFeatureToggle);

AddFeatureToggle.propTypes = {
    dispatch: PropTypes.func.isRequired,
};


export default AddFeatureToggle;
