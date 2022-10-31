import { VFC } from 'react';
import { Box, Button, Typography, styled, Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { HelpOutline } from '@mui/icons-material';
import { SuggestedChangeset } from '../SuggestedChangeset/SuggestedChangeset';
import { useSuggestedChangesDraft } from 'hooks/api/getters/useSuggestedChangesDraft/useSuggestedChangesDraft';
import { useSuggestChangeApi } from 'hooks/api/actions/useSuggestChangeApi/useSuggestChangeApi';

interface ISuggestedChangesSidebarProps {
    open: boolean;
    project: string;
    onClose: () => void;
}
const StyledPageContent = styled(PageContent)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    padding: theme.spacing(7.5, 6),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4, 2),
    },
    '& .header': {
        padding: theme.spacing(0, 0, 2, 0),
    },
    '& .body': {
        padding: theme.spacing(3, 0, 0, 0),
    },
    borderRadius: `${theme.spacing(1.5, 0, 0, 1.5)} !important`,
}));

const StyledHelpOutline = styled(HelpOutline)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginLeft: '0.3rem',
    color: theme.palette.grey[700],
}));

const StyledHeaderHint = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

export const SuggestedChangesSidebar: VFC<ISuggestedChangesSidebarProps> = ({
    open,
    project,
    onClose,
}) => {
    const {
        draft,
        loading,
        refetch: refetchSuggestedChanges,
    } = useSuggestedChangesDraft(project);
    const { changeState } = useSuggestChangeApi();

    const onReview = async (draftId: number) => {
        try {
            await changeState(project, draftId, { state: 'In review' });
            refetchSuggestedChanges();
        } catch (e) {
            console.log('something went wrong');
        }
    };
    const onDiscard = async () => {
        alert('discard');
    };
    const onApply = async () => {
        try {
            alert('apply');
        } catch (e) {
            console.log(e);
        }
    };

    if (!loading && !draft) {
        return (
            <SidebarModal open={open} onClose={onClose} label="Review changes">
                <StyledPageContent
                    header={
                        <PageHeader
                            secondary
                            titleElement="Review your changes"
                        ></PageHeader>
                    }
                >
                    There are no changes to review.
                    {/* FIXME: empty state */}
                </StyledPageContent>
            </SidebarModal>
        );
    }

    return (
        <SidebarModal open={open} onClose={onClose} label="Review changes">
            <StyledPageContent
                header={
                    <PageHeader
                        secondary
                        titleElement={
                            <>
                                Review your changes
                                <Tooltip
                                    title="You can review your changes from this page.
                                    Needs a text to explain the process."
                                    arrow
                                >
                                    <StyledHelpOutline />
                                </Tooltip>
                                <StyledHeaderHint>
                                    Make sure you are sending the right changes
                                    suggestions to be reviewed
                                </StyledHeaderHint>
                            </>
                        }
                    ></PageHeader>
                }
            >
                {draft?.map(environmentChangeset => (
                    <Box
                        key={environmentChangeset.id}
                        sx={{
                            padding: 2,
                            border: '2px solid',
                            borderColor: theme => theme.palette.neutral.light,
                            borderRadius: theme =>
                                `${theme.shape.borderRadiusLarge}px`,
                        }}
                    >
                        <Typography>
                            env: {environmentChangeset?.environment}
                        </Typography>
                        <Typography>
                            state: {environmentChangeset?.state}
                        </Typography>
                        <hr />
                        <SuggestedChangeset
                            suggestedChange={environmentChangeset}
                        />
                        <Box sx={{ display: 'flex' }}>
                            <ConditionallyRender
                                condition={
                                    environmentChangeset?.state === 'APPROVED'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeset?.state === 'CLOSED'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeset?.state === 'APPROVED'
                                }
                                show={
                                    <>
                                        <Button
                                            sx={{ mt: 2 }}
                                            variant="contained"
                                            onClick={onApply}
                                        >
                                            Apply changes
                                        </Button>
                                    </>
                                }
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeset?.state === 'Draft'
                                }
                                show={
                                    <>
                                        <Button
                                            sx={{ mt: 2, ml: 'auto' }}
                                            variant="contained"
                                            onClick={() =>
                                                onReview(
                                                    environmentChangeset.id
                                                )
                                            }
                                        >
                                            Request changes
                                        </Button>
                                        <Button
                                            sx={{ mt: 2, ml: 2 }}
                                            variant="outlined"
                                            onClick={onDiscard}
                                        >
                                            Discard changes
                                        </Button>
                                    </>
                                }
                            />
                        </Box>
                    </Box>
                ))}
            </StyledPageContent>
        </SidebarModal>
    );
};
