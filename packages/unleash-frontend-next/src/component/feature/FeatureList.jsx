import React, { PropTypes } from 'react';
import Feature from './Feature';

const FeatureList = ({ features, onFeatureClick }) => (
  <ul>
    {features.map(featureToggle =>
      <Feature
        key={featureToggle.id}
        {...featureToggle}
        onClick={() => onFeatureClick(featureToggle.id)}
      />
    )}
  </ul>
);

FeatureList.propTypes = {
    onFeatureClick: PropTypes.func.isRequired,
    features: PropTypes.array.isRequired,
};

export default FeatureList;
