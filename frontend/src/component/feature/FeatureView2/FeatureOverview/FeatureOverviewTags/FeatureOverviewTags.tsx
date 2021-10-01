import { Chip } from '@material-ui/core';
import { Label } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import useTags from '../../../../../hooks/api/getters/useTags/useTags';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { useStyles } from './FeatureOverviewTags.styles';

import slackIcon from '../../../../../assets/icons/slack.svg';
import jiraIcon from '../../../../../assets/icons/jira.svg';
import webhookIcon from '../../../../../assets/icons/webhooks.svg';
import { formatAssetPath } from '../../../../../utils/format-path';
import useTagTypes from '../../../../../hooks/api/getters/useTagTypes/useTagTypes';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import AddTagDialogContainer from '../../../add-tag-dialog-container';

const FeatureOverviewTags = () => {
    const styles = useStyles();
    const { featureId } = useParams<IFeatureViewParams>();
    const { tags, refetch } = useTags(featureId);
    const { tagTypes } = useTagTypes();
    const { deleteTag } = useFeatureApi();

    const handleDelete = async (type: string, value: string) => {
        try {
            await deleteTag(featureId, type, value);
            refetch();
        } catch (e) {
            // TODO: Handle error
            console.log(e);
        }
    };

    const tagIcon = (typeName: string) => {
        let tagType = tagTypes.find(type => type.name === typeName);

        const style = { width: '20px', height: '20px', marginRight: '5px' };

        if (tagType && tagType.icon) {
            switch (tagType.name) {
                case 'slack':
                    return (
                        <img
                            style={style}
                            alt="slack"
                            src={formatAssetPath(slackIcon)}
                        />
                    );
                case 'jira':
                    return (
                        <img
                            style={style}
                            alt="jira"
                            src={formatAssetPath(jiraIcon)}
                        />
                    );
                case 'webhook':
                    return (
                        <img
                            style={style}
                            alt="webhook"
                            src={formatAssetPath(webhookIcon)}
                        />
                    );
                default:
                    return <Label />;
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
            onDelete={() => handleDelete(t.type, t.value)}
        />
    );

    return (
        <div className={styles.container}>
            <div className={styles.tagheaderContainer}>
                <div className={styles.tagHeader}>
                    <Label className={styles.tag} />
                    <h4 className={styles.tagHeaderText}>Tags</h4>
                </div>

                <AddTagDialogContainer featureToggleName={featureId} />
                {/* <IconButton>
                    <Add />
                </IconButton> */}
            </div>

            <div className={styles.tagContent}>{tags.map(renderTag)}</div>
        </div>
    );
};

export default FeatureOverviewTags;
