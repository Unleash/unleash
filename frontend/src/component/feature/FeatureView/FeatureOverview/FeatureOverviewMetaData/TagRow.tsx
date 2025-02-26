import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useContext, useState } from 'react';
import { Chip, styled, Tooltip } from '@mui/material';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import DeleteTagIcon from '@mui/icons-material/Cancel';
import { ManageTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { ITag } from 'interfaces/tags';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { StyledMetaDataItem } from './FeatureOverviewMetaData';
import { AddTagButton } from './AddTagButton';

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

const StyledTag = styled(Chip)(({ theme }) => ({
    overflowWrap: 'anywhere',
    lineHeight: theme.typography.body1.lineHeight,
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.25),
    height: theme.spacing(3.5),
}));

const StyledEllipsis = styled('span')(({ theme }) => ({
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
                        {tags.map((tag) => {
                            const tagLabel = `${tag.type}:${tag.value}`;
                            const isOverflowing = tagLabel.length > 25;
                            return (
                                <StyledTag
                                    key={tagLabel}
                                    label={
                                        <Tooltip
                                            key={tagLabel}
                                            title={
                                                isOverflowing ? tagLabel : ''
                                            }
                                            arrow
                                        >
                                            <span>
                                                {tagLabel.substring(0, 25)}
                                                {isOverflowing ? (
                                                    <StyledEllipsis>
                                                        …
                                                    </StyledEllipsis>
                                                ) : (
                                                    ''
                                                )}
                                            </span>
                                        </Tooltip>
                                    }
                                    size='small'
                                    deleteIcon={
                                        <Tooltip title='Remove tag' arrow>
                                            <DeleteTagIcon />
                                        </Tooltip>
                                    }
                                    onDelete={
                                        canUpdateTags
                                            ? () => {
                                                  setRemoveTagOpen(true);
                                                  setSelectedTag(tag);
                                              }
                                            : undefined
                                    }
                                />
                            );
                        })}
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
