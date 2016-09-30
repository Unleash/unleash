/* eslint no-shadow: ["error", { "allow": ["name"] }]*/

import React, { PropTypes } from 'react';
import { Switch, FontIcon } from 'react-toolbox';

const Feature = ({ onClick, name, enabled, strategies }) => (
  <tr>
    <td style={{ paddingTop: '1.5rem' }}><Switch onChange={onClick} checked={enabled} /></td>
    <td><a href="/edit">{name}</a></td>
    <td>{strategies.map(s => `${s.name}, `)}</td>
    <td style={{ textAlign: 'right' }}>
      <FontIcon value="edit" />
      <FontIcon value="delete"  style={{ color: 'red' }} />
    </td>
  </tr>
);

Feature.propTypes = {
    onClick: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    strategies: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
};

export default Feature;
