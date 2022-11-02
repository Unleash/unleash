import { VFC } from 'react';
import {
    Box,
    Button,
    Typography,
    styled,
    Tooltip,
    Divider,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { HelpOutline } from '@mui/icons-material';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useChangeRequestDraft } from 'hooks/api/getters/useChangeRequestDraft/useChangeRequestDraft';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { StatusChip } from 'component/common/StatusChip/StatusChip';

interface IChangeRequestSidebarProps {
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

export const ChangeRequestSidebar: VFC<IChangeRequestSidebarProps> = ({
    open,
    project,
    onClose,
}) => {
    const {
        draft,
        loading,
        refetch: refetchChangeRequest,
    } = useChangeRequestDraft(project);
    const { changeState } = useChangeRequestApi();

    const onReview = async (draftId: number) => {
        try {
            await changeState(project, draftId, { state: 'In review' });
            refetchChangeRequest();
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
                                    to be reviewed
                                </StyledHeaderHint>
                            </>
                        }
                    ></PageHeader>
                }
            >
                {draft?.map(environmentChangeRequest => (
                    <Box
                        key={environmentChangeRequest.id}
                        sx={{
                            padding: 2,
                            border: '2px solid',
                            borderColor: theme => theme.palette.neutral.light,
                            borderRadius: theme =>
                                `${theme.shape.borderRadiusLarge}px`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex' }}>
                                <EnvironmentIcon enabled={true} />
                                <Typography component="span" variant="h2">
                                    {environmentChangeRequest?.environment}
                                </Typography>
                            </Box>
                            <Box sx={{ ml: 'auto' }}>
                                <StatusChip
                                    label={environmentChangeRequest?.state}
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="body1" color="text.secondary">
                            You request changes for these feature toggles:
                        </Typography>
                        <ChangeRequest
                            changeRequest={environmentChangeRequest}
                            onNavigate={() => {
                                onClose();
                            }}
                            onRefetch={refetchChangeRequest}
                        />
                        <Box sx={{ display: 'flex' }}>
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest?.state ===
                                    'APPROVED'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest?.state === 'CLOSED'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest?.state ===
                                    'APPROVED'
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
                                    environmentChangeRequest?.state === 'Draft'
                                }
                                show={
                                    <>
                                        <Button
                                            sx={{ mt: 2, ml: 'auto' }}
                                            variant="contained"
                                            onClick={() =>
                                                onReview(
                                                    environmentChangeRequest.id
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
