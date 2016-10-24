import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import FontIcon from 'react-toolbox/lib/font_icon';
import Switch from 'react-toolbox/lib/switch';
import { ListItem } from 'react-toolbox/lib/list';

import style from './feature.scss';

const Feature = ({ feature, onFeatureClick, onFeatureRemove }) => {
    const { name, description, enabled, strategies } = feature; // eslint-disable-line no-shadow

    const actions = [
        strategies.map(s => s.name).join(', '),
        <Link to={`/features/edit/${name}`} title={`Edit ${name}`}>
            <FontIcon value="edit" className={style.action} />
        </Link>,
        <FontIcon className={style.action} value="delete" onClick={() => onFeatureRemove(name)} />,
    ];

    const leftActions = [
        <Switch onChange={() => onFeatureClick(feature)} checked={enabled} />,
    ];

    return (
        <ListItem
            leftActions={leftActions}
            rightActions={actions}
            caption={<Link to={`/features/edit/${name}`} title={`Edit ${name}`} className={style.link}>
                {name}
            </Link>}
            legend={(description && description.substring(0, 100)) || '-'}
        />
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    onFeatureClick: PropTypes.func,
    onFeatureRemove: PropTypes.func,
};

export default Feature;
