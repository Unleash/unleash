import React from 'react';
import PropTypes from 'prop-types';
import { Chip, ChipContact, Icon } from 'react-mdl';
function FeatureTagComponent({ tags, tagTypes, featureToggleName, untagFeature }) {
    const onUntagFeature = tag => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to remove this tag')) {
            untagFeature(featureToggleName, tag);
        }
    };

    const tagIcon = typeName => {
        let tagType = tagTypes.find(type => type.name === typeName);
        if (tagType && tagType.icon) {
            return <Icon name={tagType.icon} />;
        } else {
            return <span>{typeName[0].toUpperCase()}</span>;
        }
    };

    const renderTag = t => (
        <Chip
            onClose={() => onUntagFeature(t)}
            title={t.value}
            key={`${t.type}:${t.value}`}
            style={{ marginRight: '3px', fontSize: '0.8em' }}
        >
            <ChipContact className="mdl-color--grey-500">{tagIcon(t.type)}</ChipContact>
            {t.value}
        </Chip>
    );

    return tags && tags.length > 0 ? (
        <div>
            <p style={{ marginBottom: 0 }}>Tags</p>
            {tags.map(renderTag)}
        </div>
    ) : null;
}

FeatureTagComponent.propTypes = {
    tags: PropTypes.array,
    tagTypes: PropTypes.array,
    featureToggleName: PropTypes.string.isRequired,
    untagFeature: PropTypes.func,
};

export default FeatureTagComponent;
