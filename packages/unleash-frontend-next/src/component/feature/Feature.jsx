/* eslint no-shadow: ["error", { "allow": ["name"] }]*/

import React, { PropTypes } from 'react';
import { Switch, FontIcon } from 'react-toolbox';
import { Link } from 'react-router';

const Feature = ({ onClick, name, enabled, strategies, onFeatureRemove }) => (
  <tr>
    <td style={{ paddingTop: '1.5rem' }}><Switch onChange={onClick} checked={enabled} /></td>
    <td>
      <Link to={`/features/edit/${name}`} title={`Edit ${name}`}>
        {name}
      </Link>
    </td>
    <td>{strategies.map(s => s.name).join(', ')}</td>
    <td style={{ textAlign: 'right' }}>
      <Link to={`/features/edit/${name}`} title={`Edit ${name}`}>
        <FontIcon value="edit" />
      </Link>
      <FontIcon style={{ cursor: 'pointer' }} value="delete" onClick={onFeatureRemove} />
    </td>
  </tr>
);

Feature.propTypes = {
    onClick: PropTypes.func.isRequired,
    onFeatureRemove: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    strategies: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
};

export default Feature;
