import React, { useContext, useState } from 'react';
import { Chip } from '@mui/material';
import { Close, Label } from '@mui/icons-material';
import useTags from 'hooks/api/getters/useTags/useTags';
import { useStyles } from './FeatureOverviewTags.styles';
import slackIcon from 'assets/icons/slack.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhookIcon from 'assets/icons/webhooks.svg';
import { formatAssetPath } from 'utils/formatPath';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ITag } from 'interfaces/tags';
import useToast from 'hooks/useToast';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

interface IFeatureOverviewTagsProps extends React.HTMLProps<HTMLDivElement> {
    projectId: string;
}

const FeatureOverviewTags: React.FC<IFeatureOverviewTagsProps> = ({
    projectId,
    ...rest
}) => {
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ITag>({
        value: '',
        type: '',
    });
    const { classes: styles } = useStyles();
    const featureId = useRequiredPathParam('featureId');
    const { tags, refetch } = useTags(featureId);
    const { tagTypes } = useTagTypes();
    const { deleteTagFromFeature } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const canDeleteTag = hasAccess(UPDATE_FEATURE, projectId);

    const handleDelete = async () => {
        try {
            await deleteTagFromFeature(
                featureId,
                selectedTag.type,
                selectedTag.value
            );
            refetch();
            setToastData({
                type: 'success',
                title: 'Tag deleted',
                text: 'Successfully deleted tag',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
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
                            alt="Slack"
                            src={formatAssetPath(slackIcon)}
                        />
                    );
                case 'jira':
                    return (
                        <img
                            style={style}
                            alt="JIRA"
                            src={formatAssetPath(jiraIcon)}
                        />
                    );
                case 'webhook':
                    return (
                        <img
                            style={style}
                            alt="Webhook"
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

    const renderTag = (t: ITag) => (
        <Chip
            icon={tagIcon(t.type)}
            className={styles.tagChip}
            data-loading
            label={t.value}
            key={`${t.type}:${t.value}`}
            deleteIcon={
                <Close className={styles.closeIcon} titleAccess="Remove" />
            }
            onDelete={
                canDeleteTag
                    ? () => {
                          setShowDelDialog(true);
                          setSelectedTag({ type: t.type, value: t.value });
                      }
                    : undefined
            }
        />
    );

    return (
        <div className={styles.container} {...rest}>
            <Dialogue
                open={showDelDialog}
                onClose={() => {
                    setShowDelDialog(false);
                    setSelectedTag({ type: '', value: '' });
                }}
                onClick={() => {
                    setShowDelDialog(false);
                    handleDelete();
                    setSelectedTag({ type: '', value: '' });
                }}
                title="Are you sure you want to delete this tag?"
            />

            <div>
                <ConditionallyRender
                    condition={tags.length > 0}
                    show={tags.map(renderTag)}
                    elseShow={<p data-loading>No tags to display</p>}
                />
            </div>
        </div>
    );
};

export default FeatureOverviewTags;
