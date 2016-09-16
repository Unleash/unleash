import React from 'react';
import { connect } from 'react-redux';
import { addFeatureToggle } from '../../action';


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

export default AddFeatureToggle;
