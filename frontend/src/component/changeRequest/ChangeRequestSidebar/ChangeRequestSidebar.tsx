import { useState, type VFC } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest.tsx';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { EnvironmentChangeRequest } from './EnvironmentChangeRequest/EnvironmentChangeRequest.tsx';
import { ReviewChangesHeader } from './ReviewChangesHeader/ReviewChangesHeader.tsx';
import { ChangeRequestPlausibleProvider } from '../ChangeRequestContext.tsx';

interface IChangeRequestSidebarProps {
    open: boolean;
    project: string;
    onClose: () => void;
}

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    padding: theme.spacing(6),
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

const BackButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
}));

export const StyledSuccessIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
    height: '32px',
    width: '32px',
    marginRight: theme.spacing(1),
}));

export const StyledFlexAlignCenterBox = styled(Box)(() => ({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
}));

export const Separator = () => (
    <Typography
        component='span'
        sx={{
            marginLeft: 1.5,
            marginRight: 1.5,
            color: 'divider',
        }}
    >
        |
    </Typography>
);

export const ChangeRequestSidebar: VFC<IChangeRequestSidebarProps> = ({
    open,
    project,
    onClose,
}) => {
    const {
        data,
        loading,
        refetch: refetchChangeRequest,
    } = usePendingChangeRequests(project);
    const { discardDraft } = useChangeRequestApi();
    const { setToastApiError } = useToast();
    const [
        changeRequestChangesWillOverwrite,
        setChangeRequestChangesWillOverwrite,
    ] = useState(false);

    const onReview = async (
        changeState: (project: string) => Promise<void>,
    ) => {
        try {
            await changeState(project);
            refetchChangeRequest();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDiscard = async (draftId: number) => {
        try {
            await discardDraft(project, draftId);
            refetchChangeRequest();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!loading && !data) {
        return (
            <SidebarModal open={open} onClose={onClose} label='Review changes'>
                <StyledPageContent
                    disableBorder={true}
                    header={<PageHeader titleElement='Review your changes' />}
                >
                    There are no changes to review.
                    {/* FIXME: empty state */}
                    <BackButton onClick={onClose}>Close</BackButton>
                </StyledPageContent>
            </SidebarModal>
        );
    }

    return (
        <SidebarModal open={open} onClose={onClose} label='Review changes'>
            <StyledPageContent
                disableBorder={true}
                header={<ReviewChangesHeader />}
            >
                {data?.map((environmentChangeRequest) => (
                    <ChangeRequestPlausibleProvider
                        key={environmentChangeRequest.id}
                        value={{
                            willOverwriteStrategyChanges:
                                changeRequestChangesWillOverwrite,
                            registerWillOverwriteStrategyChanges: () =>
                                setChangeRequestChangesWillOverwrite(true),
                        }}
                    >
                        <EnvironmentChangeRequest
                            key={environmentChangeRequest.id}
                            environmentChangeRequest={environmentChangeRequest}
                            onClose={onClose}
                            onReview={onReview}
                            onDiscard={onDiscard}
                        >
                            <ChangeRequest
                                changeRequest={environmentChangeRequest}
                                onNavigate={onClose}
                                onRefetch={refetchChangeRequest}
                            />
                        </EnvironmentChangeRequest>
                    </ChangeRequestPlausibleProvider>
                ))}
            </StyledPageContent>
        </SidebarModal>
    );
};
