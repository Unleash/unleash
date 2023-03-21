import { IFeatureToggle } from 'interfaces/featureToggle';
import { useContext, useState } from 'react';
import { Button, Chip, Divider, styled } from '@mui/material';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import { Add, Cancel } from '@mui/icons-material';
import { ManageTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageTagsDialog';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ITag } from 'interfaces/tags';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
}));

const StyledTagContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(3),
    borderStyle: 'dashed',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    maxWidth: theme.spacing(20),
    alignSelf: 'center',
}));

interface IFeatureOverviewSidePanelTagsProps {
    feature: IFeatureToggle;
    header: React.ReactNode;
}

export const FeatureOverviewSidePanelTags = ({
    feature,
    header,
}: IFeatureOverviewSidePanelTagsProps) => {
    const { tags, refetch } = useFeatureTags(feature.name);
    const { deleteTagFromFeature } = useFeatureApi();

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ITag>();

    const { setToastData, setToastApiError } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const canUpdateTags = hasAccess(UPDATE_FEATURE, feature.project);

    const handleDelete = async () => {
        if (!selectedTag) return;
        try {
            await deleteTagFromFeature(
                feature.name,
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

    return (
        <StyledContainer>
            {header}
            <StyledTagContainer>
                {tags.map(tag => {
                    const tagLabel = `${tag.type}:${tag.value}`;
                    return (
                        <StyledChip
                            key={tagLabel}
                            label={tagLabel}
                            deleteIcon={<Cancel titleAccess="Remove" />}
                            onDelete={
                                canUpdateTags
                                    ? () => {
                                          setShowDelDialog(true);
                                          setSelectedTag(tag);
                                      }
                                    : undefined
                            }
                        />
                    );
                })}
            </StyledTagContainer>
            <ConditionallyRender
                condition={canUpdateTags}
                show={
                    <>
                        <ConditionallyRender
                            condition={tags.length > 0}
                            show={<StyledDivider />}
                        />
                        <StyledButton
                            data-loading
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => setOpenTagDialog(true)}
                        >
                            Add new tag
                        </StyledButton>
                    </>
                }
            />
            <ManageTagsDialog open={openTagDialog} setOpen={setOpenTagDialog} />
            <Dialogue
                open={showDelDialog}
                primaryButtonText="Delete tag"
                secondaryButtonText="Cancel"
                onClose={() => {
                    setShowDelDialog(false);
                    setSelectedTag(undefined);
                }}
                onClick={() => {
                    setShowDelDialog(false);
                    handleDelete();
                    setSelectedTag(undefined);
                }}
                title="Delete tag?"
            >
                You are about to delete tag:{' '}
                <strong>
                    {selectedTag?.type}:{selectedTag?.value}
                </strong>
            </Dialogue>
        </StyledContainer>
    );
};
