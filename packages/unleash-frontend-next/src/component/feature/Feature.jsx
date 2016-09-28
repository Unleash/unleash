/* eslint no-shadow: ["error", { "allow": ["name"] }]*/

import React, { PropTypes } from 'react';

const Feature = ({ onClick, name, enabled }) => (
  <li>
    {name} is {enabled ? 'enabled ' : 'disabled '}
    <a onClick={onClick} href="#">toggle</a>
  </li>
);

Feature.propTypes = {
    onClick: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
};

export default Feature;
