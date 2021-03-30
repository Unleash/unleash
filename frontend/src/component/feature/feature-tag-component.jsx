import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Chip } from '@material-ui/core';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';
import Dialogue from '../common/Dialogue';
function FeatureTagComponent({ tags, tagTypes, featureToggleName, untagFeature }) {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState(undefined);
    const onUntagFeature = tag => {
        // eslint-disable-next-line no-alert
        untagFeature(featureToggleName, tag);
        setSelectedTag(undefined);
    };

    const tagIcon = typeName => {
        let tagType = tagTypes.find(type => type.name === typeName);

        const style = { width: '20px', height: '20px', marginRight: '5px' };

        if (tagType && tagType.icon) {
            switch (tagType.name) {
                case 'slack':
                    return <img style={style} alt="slack" src="public/slack.svg" />;
                case 'jira':
                    return <img style={style} alt="jira" src="public/jira.svg" />;
                case 'webhook':
                    return <img style={style} alt="webhook" src="public/webhooks.svg" />;
                default:
                    return <Icon>label</Icon>;
            }
        } else {
            return <span>{typeName[0].toUpperCase()}</span>;
        }
    };

    const renderTag = t => (
        <Chip
            icon={tagIcon(t.type)}
            style={{ marginRight: '3px', fontSize: '0.8em' }}
            label={t.value}
            key={`${t.type}:${t.value}`}
            onDelete={() => {
                setSelectedTag(t);
                setShowDialog(true);
            }}
        />
    );

    return (
        <ConditionallyRender
            condition={tags && tags.length > 0}
            show={
                <div>
                    <Dialogue
                        open={showDialog}
                        onClose={() => {
                            setShowDialog(false);
                            setSelectedTag(undefined);
                        }}
                        onClick={() => {
                            onUntagFeature(selectedTag);
                            setShowDialog(false);
                        }}
                        title="Are you sure you want to delete this tag?"
                    />
                    <p style={{ marginBottom: 0 }}>Tags</p>
                    {tags.map(renderTag)}
                </div>
            }
        />
    );
}

FeatureTagComponent.propTypes = {
    tags: PropTypes.array,
    tagTypes: PropTypes.array,
    featureToggleName: PropTypes.string.isRequired,
    untagFeature: PropTypes.func,
};

export default FeatureTagComponent;
