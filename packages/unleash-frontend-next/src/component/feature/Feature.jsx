import React, { PropTypes } from 'react';

const Feature = ({ onClick, featureName, enabled }) => (
  <li>
    {featureName} is {enabled ? 'enabled ' : 'disabled '}
    <a onClick={onClick} href="#">toggle</a>
  </li>
);

Feature.propTypes = {
    onClick: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    featureName: PropTypes.string.isRequired,
};

export default Feature;
