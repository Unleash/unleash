import { useState, useContext } from 'react'; 
import { Chip } from '@material-ui/core';
import { Add, Label } from '@material-ui/icons';
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
import AddTagDialog from './AddTagDialog/AddTagDialog';
import Dialogue from '../../../../common/Dialogue';
import { ITag } from '../../../../../interfaces/tags';
import useToast from '../../../../../hooks/useToast';
import { UPDATE_FEATURE, DELETE_TAG } from '../../../../AccessProvider/permissions';
import PermissionIconButton from '../../../../common/PermissionIconButton/PermissionIconButton';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import AccessContext from '../../../../../contexts/AccessContext';

const FeatureOverviewTags = () => {
    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ITag>({
        value: '',
        type: '',
    });
    const styles = useStyles();
    const { featureId } = useParams<IFeatureViewParams>();
    const { tags, refetch } = useTags(featureId);
    const { tagTypes } = useTagTypes();
    const { deleteTagFromFeature } = useFeatureApi();
    const { toast, setToastData } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const canDeleteTag = hasAccess(DELETE_TAG);

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
                show: true,
                text: 'Successfully deleted tag',
            });
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
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
            className={styles.tagChip}
            data-loading
            label={t.value}
            key={`${t.type}:${t.value}`}
            onDelete={canDeleteTag ? () => {
                setShowDelDialog(true);
                setSelectedTag({ type: t.type, value: t.value });
            }: undefined}
        />
    );

    return (
        <div className={styles.container}>
            <div className={styles.tagheaderContainer}>
                <div className={styles.tagHeader}>
                    <h4 className={styles.tagHeaderText} data-loading>
                        Tags
                    </h4>
                </div>
                <AddTagDialog open={openTagDialog} setOpen={setOpenTagDialog} />
                <PermissionIconButton
                    onClick={() => setOpenTagDialog(true)}
                    permission={UPDATE_FEATURE}
                    tooltip="Add tag"
                    data-loading
                >
                    <Add />
                </PermissionIconButton>
            </div>

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

            <div className={styles.tagContent}>
                <ConditionallyRender
                    condition={tags.length > 0}
                    show={tags.map(renderTag)}
                    elseShow={<p data-loading>No tags to display</p>}
                />
            </div>
            {toast}
        </div>
    );
};

export default FeatureOverviewTags;
