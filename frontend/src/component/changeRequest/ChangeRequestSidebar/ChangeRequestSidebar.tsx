import { FC, VFC } from 'react';
import {
    Box,
    Button,
    Typography,
    styled,
    Tooltip,
    Divider,
    IconButton,
    useTheme,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { CheckCircle, HelpOutline } from '@mui/icons-material';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useChangeRequestOpen } from 'hooks/api/getters/useChangeRequestOpen/useChangeRequestOpen';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestStatusBadge } from '../ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

interface IChangeRequestSidebarProps {
    open: boolean;
    project: string;
    onClose: () => void;
}

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    minWidth: '50vw',
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

const BackButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
}));

const SubmitChangeRequestButton: FC<{ onClick: () => void; count: number }> = ({
    onClick,
    count,
}) => (
    <Button sx={{ mt: 2, ml: 'auto' }} variant="contained" onClick={onClick}>
        Submit change request ({count})
    </Button>
);

export const StyledSuccessIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
    height: '25px',
    width: '25px',
    marginRight: theme.spacing(1),
}));

export const StyledFlexAlignCenterBox = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
}));

export const Separator = () => (
    <Typography
        component="span"
        sx={{
            marginLeft: 2,
            marginRight: 2,
            color: theme => theme.palette.neutral.light,
        }}
    >
        |
    </Typography>
);

export const UpdateCount: FC<{ count: number }> = ({ count }) => (
    <Box>
        <Typography component="span" variant="body1" color="text.secondary">
            Updates:{' '}
        </Typography>
        <Typography
            component="span"
            sx={{
                fontWeight: 'bold',
            }}
        >
            {count} {count === 1 ? 'feature toggle' : 'feature toggles'}
        </Typography>
    </Box>
);

export const ChangeRequestSidebar: VFC<IChangeRequestSidebarProps> = ({
    open,
    project,
    onClose,
}) => {
    const {
        draft,
        loading,
        refetch: refetchChangeRequest,
    } = useChangeRequestOpen(project);
    const { changeState } = useChangeRequestApi();
    const theme = useTheme();
    const navigate = useNavigate();

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
            <DynamicSidebarModal
                open={open}
                onClose={onClose}
                label="Review changes"
            >
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
                    <BackButton onClick={onClose}>Close</BackButton>
                </StyledPageContent>
            </DynamicSidebarModal>
        );
    }

    return (
        <DynamicSidebarModal
            open={open}
            onClose={onClose}
            label="Review changes"
        >
            <StyledPageContent
                header={
                    <PageHeader
                        secondary
                        actions={
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        }
                        titleElement={
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Review your changes
                                    <Tooltip
                                        title="You can review your changes from this page.
                                    Needs a text to explain the process."
                                        arrow
                                    >
                                        <StyledHelpOutline />
                                    </Tooltip>
                                </Box>
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <EnvironmentIcon enabled={true} />
                                <Typography component="span" variant="h2">
                                    {environmentChangeRequest.environment}
                                </Typography>
                                <Separator />
                                <UpdateCount
                                    count={
                                        environmentChangeRequest.features.length
                                    }
                                />
                            </Box>
                            <Box sx={{ ml: 'auto' }}>
                                <ChangeRequestStatusBadge
                                    state={environmentChangeRequest.state}
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
                                    environmentChangeRequest.state ===
                                    'Approved'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest.state === 'Applied'
                                }
                                show={<Typography>Applied</Typography>}
                            />
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest.state ===
                                    'Approved'
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
                                        <SubmitChangeRequestButton
                                            onClick={() =>
                                                onReview(
                                                    environmentChangeRequest.id
                                                )
                                            }
                                            count={
                                                environmentChangeRequest
                                                    .features.length
                                            }
                                        />

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
                            <ConditionallyRender
                                condition={
                                    environmentChangeRequest.state ===
                                    'In review'
                                }
                                show={
                                    <>
                                        <StyledFlexAlignCenterBox>
                                            <StyledSuccessIcon />
                                            <Typography
                                                color={
                                                    theme.palette.success.main
                                                }
                                            >
                                                Draft successfully sent to
                                                review
                                            </Typography>
                                            <Button
                                                sx={{ marginLeft: 2 }}
                                                variant="outlined"
                                                onClick={() => {
                                                    onClose();
                                                    navigate(
                                                        `/projects/${environmentChangeRequest.project}/change-requests/${environmentChangeRequest.id}`
                                                    );
                                                }}
                                            >
                                                View change request page
                                            </Button>
                                        </StyledFlexAlignCenterBox>
                                    </>
                                }
                            />
                        </Box>
                    </Box>
                ))}
            </StyledPageContent>
        </DynamicSidebarModal>
    );
};
