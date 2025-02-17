import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useContext, useState } from 'react';
import { Chip, styled, Tooltip } from '@mui/material';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import Add from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { ManageTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { ITag } from 'interfaces/tags';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledMetaDataItem,
    StyledMetaDataItemLabel,
} from './FeatureOverviewMetaData';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

const StyledPermissionButton = styled(PermissionButton)(({ theme }) => ({
    '&&&': {
        fontSize: theme.fontSizes.smallBody,
        lineHeight: 1,
        margin: 0,
    },
}));

const StyledTagRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'start',
    minHeight: theme.spacing(4.25),
    lineHeight: theme.spacing(4.25),
    fontSize: theme.fontSizes.smallBody,
    justifyContent: 'start',
}));

const StyledTagContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(0.75),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    overflowWrap: 'anywhere',
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.neutral.dark,
    '&&& > svg': {
        color: theme.palette.neutral.dark,
        fontSize: theme.fontSizes.smallBody,
    },
}));

const StyledAddedTag = styled(StyledChip)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.dark,
    '&&& > svg': {
        color: theme.palette.secondary.dark,
        fontSize: theme.fontSizes.smallBody,
    },
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
            <ConditionallyRender
                condition={!tags.length}
                show={
                    <StyledMetaDataItem>
                        <StyledMetaDataItemLabel>Tags:</StyledMetaDataItemLabel>
                        <StyledPermissionButton
                            size='small'
                            permission={UPDATE_FEATURE}
                            projectId={feature.project}
                            variant='text'
                            onClick={() => {
                                setManageTagsOpen(true);
                            }}
                        >
                            Add tag
                        </StyledPermissionButton>
                    </StyledMetaDataItem>
                }
                elseShow={
                    <StyledTagRow>
                        <StyledMetaDataItemLabel>Tags:</StyledMetaDataItemLabel>
                        <StyledTagContainer>
                            {tags.map((tag) => {
                                const tagLabel = `${tag.type}:${tag.value}`;
                                return (
                                    <Tooltip
                                        key={tagLabel}
                                        title={
                                            tagLabel.length > 35 ? tagLabel : ''
                                        }
                                        arrow
                                    >
                                        <StyledAddedTag
                                            label={tagLabel}
                                            size='small'
                                            deleteIcon={
                                                <Tooltip
                                                    title='Remove tag'
                                                    arrow
                                                >
                                                    <ClearIcon />
                                                </Tooltip>
                                            }
                                            onDelete={
                                                canUpdateTags
                                                    ? () => {
                                                          setRemoveTagOpen(
                                                              true,
                                                          );
                                                          setSelectedTag(tag);
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </Tooltip>
                                );
                            })}
                            <ConditionallyRender
                                condition={canUpdateTags}
                                show={
                                    <StyledChip
                                        icon={<Add />}
                                        label='Add tag'
                                        size='small'
                                        onClick={() => setManageTagsOpen(true)}
                                    />
                                }
                            />
                        </StyledTagContainer>
                    </StyledTagRow>
                }
            />
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
