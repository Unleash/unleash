import React, { useContext, useState } from 'react';
import { Chip, styled } from '@mui/material';
import { Close, Label } from '@mui/icons-material';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
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

interface IFeatureOverviewTagsProps {
    projectId: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down(800)]: {
        width: '100%',
        maxWidth: 'none',
    },
}));

const StyledTagChip = styled(Chip)(({ theme }) => ({
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.text.tertiaryContrast,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledCloseIcon = styled(Close)(({ theme }) => ({
    color: theme.palette.primary.light,
    '&:hover': {
        color: theme.palette.primary.light,
    },
}));

const FeatureOverviewTags: React.FC<IFeatureOverviewTagsProps> = ({
    projectId,
    ...rest
}) => {
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ITag>({
        value: '',
        type: '',
    });
    const featureId = useRequiredPathParam('featureId');
    const { tags, refetch } = useFeatureTags(featureId);
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
        <StyledTagChip
            icon={tagIcon(t.type)}
            data-loading
            label={t.value}
            key={`${t.type}:${t.value}`}
            deleteIcon={<StyledCloseIcon titleAccess="Remove" />}
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
        <StyledContainer {...rest}>
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
        </StyledContainer>
    );
};

export default FeatureOverviewTags;
