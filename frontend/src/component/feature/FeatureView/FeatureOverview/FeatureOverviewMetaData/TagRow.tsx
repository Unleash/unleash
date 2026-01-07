import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useContext, useState } from 'react';
import { styled, Tooltip, Chip } from '@mui/material';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import ClearIcon from '@mui/icons-material/Clear';
import { ManageTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { ITag } from 'interfaces/tags';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { StyledMetaDataItem } from './FeatureOverviewMetaData.tsx';
import { AddTagButton } from './AddTagButton.tsx';
import { Tag } from 'component/common/Tag/Tag';
import { formatTag } from 'utils/format-tag';

const StyledLabel = styled('span')(({ theme }) => ({
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

const StyledTagRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    minHeight: theme.spacing(4.5),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledTagContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    overflow: 'hidden',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(0.75),
}));

const _StyledTag = styled(Chip)(({ theme }) => ({
    overflowWrap: 'anywhere',
    lineHeight: theme.typography.body1.lineHeight,
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.25),
    height: theme.spacing(3.5),
}));

const _StyledEllipsis = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface IFeatureOverviewSidePanelTagsProps {
    feature: IFeatureToggle;
}

export const TagRow = ({ feature }: IFeatureOverviewSidePanelTagsProps) => {
    const { tags, refetch } = useFeatureTags(feature.name);
    const { deleteTagFromFeature } = useFeatureApi();
    const [manageTagsOpen, setManageTagsOpen] = useState(false);
    const [removeTagOpen, setRemoveTagOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ITag>();

    const { setToastData, setToastApiError } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const canUpdateTags = hasAccess(UPDATE_FEATURE, feature.project);

    const handleAdd = () => {
        setManageTagsOpen(true);
    };

    const handleRemove = async () => {
        if (!selectedTag) return;
        try {
            await deleteTagFromFeature(
                feature.name,
                selectedTag.type,
                selectedTag.value,
            );
            refetch();
            setToastData({
                type: 'success',
                text: 'Tag removed',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            {!tags.length ? (
                <StyledMetaDataItem>
                    <StyledLabel>Tags:</StyledLabel>
                    <StyledTagContainer>
                        <AddTagButton
                            project={feature.project}
                            onClick={handleAdd}
                        />
                    </StyledTagContainer>
                </StyledMetaDataItem>
            ) : (
                <StyledTagRow>
                    <StyledLabel>Tags:</StyledLabel>
                    <StyledTagContainer>
                        {tags.map((tag) => (
                            <TagItem
                                key={formatTag(tag)}
                                tag={tag}
                                canUpdateTags={canUpdateTags}
                                onTagRemove={(tag) => {
                                    setRemoveTagOpen(true);
                                    setSelectedTag(tag);
                                }}
                            />
                        ))}
                        {canUpdateTags ? (
                            <AddTagButton
                                project={feature.project}
                                onClick={handleAdd}
                            />
                        ) : null}
                    </StyledTagContainer>
                </StyledTagRow>
            )}
            <ManageTagsDialog
                open={manageTagsOpen}
                setOpen={setManageTagsOpen}
            />
            <Dialogue
                open={removeTagOpen}
                primaryButtonText='Remove tag'
                secondaryButtonText='Cancel'
                onClose={() => {
                    setRemoveTagOpen(false);
                    setSelectedTag(undefined);
                    refetch();
                }}
                onClick={() => {
                    setRemoveTagOpen(false);
                    handleRemove();
                    setSelectedTag(undefined);
                }}
                title='Remove tag'
            >
                You are about to remove tag:{' '}
                <strong>
                    {selectedTag?.type}:{selectedTag?.value}
                </strong>
            </Dialogue>
        </>
    );
};

interface ITagItemProps {
    tag: ITag;
    canUpdateTags: boolean;
    onTagRemove: (tag: ITag) => void;
}

const TagItem = ({ tag, canUpdateTags, onTagRemove }: ITagItemProps) => {
    const tagLabel = formatTag(tag);
    const isOverflowing = tagLabel.length > 25;

    const onDelete = canUpdateTags ? () => onTagRemove(tag) : undefined;

    const deleteIcon = (
        <Tooltip title='Remove tag' arrow>
            <ClearIcon sx={{ height: '20px', width: '20px' }} />
        </Tooltip>
    );

    return (
        <Tooltip key={tagLabel} title={isOverflowing ? tagLabel : ''} arrow>
            <span>
                <Tag tag={tag} onDelete={onDelete} deleteIcon={deleteIcon} />
            </span>
        </Tooltip>
    );
};
