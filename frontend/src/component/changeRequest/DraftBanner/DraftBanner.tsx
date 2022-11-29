import { FC, useState, VFC } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { useStyles as useAppStyles } from 'component/App.styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestSidebar } from '../ChangeRequestSidebar/ChangeRequestSidebar';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { IChangeRequest } from '../changeRequest.types';
import { changesCount } from '../changesCount';

interface IDraftBannerProps {
    project: string;
}

const DraftBannerContentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 1.5),
    color: theme.palette.warning.main,
}));

const DraftBannerContent: FC<{
    changeRequest: IChangeRequest;
    onClick: () => void;
}> = ({ changeRequest, onClick }) => {
    const { classes } = useAppStyles();

    return (
        <Box className={classes.content}>
            <DraftBannerContentWrapper>
                <Typography variant="body2">
                    <strong>Change request mode</strong> – You have changes{' '}
                    <ConditionallyRender
                        condition={Boolean(changeRequest.environment)}
                        show={
                            <>
                                in <strong>{changeRequest.environment} </strong>
                            </>
                        }
                    />
                    <ConditionallyRender
                        condition={changeRequest.state === 'Draft'}
                        show={'that need to be reviewed'}
                    />
                    <ConditionallyRender
                        condition={changeRequest.state === 'In review'}
                        show={'that are in review'}
                    />
                    <ConditionallyRender
                        condition={changeRequest.state === 'Approved'}
                        show={
                            'that are approved. Adding more changes will clear the approvals and require a new review'
                        }
                    />
                </Typography>
                <Button
                    variant="contained"
                    onClick={onClick}
                    sx={{ ml: 'auto' }}
                >
                    View changes ({changesCount(changeRequest)})
                </Button>
            </DraftBannerContentWrapper>
        </Box>
    );
};

const StickyBanner = styled(Box)(({ theme }) => ({
    position: 'sticky',
    top: -1,
    zIndex: 250 /* has to lower than header.zIndex and higher than body.zIndex */,
    borderTop: `1px solid ${theme.palette.warning.border}`,
    borderBottom: `1px solid ${theme.palette.warning.border}`,
    backgroundColor: theme.palette.warning.light,
}));

export const DraftBanner: VFC<IDraftBannerProps> = ({ project }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { draft, loading } = usePendingChangeRequests(project);

    if ((!loading && !draft) || draft?.length === 0) {
        return null;
    }

    return (
        <StickyBanner>
            {draft &&
                draft
                    .filter(changeRequest =>
                        ['Draft', 'In review', 'Approved'].includes(
                            changeRequest.state
                        )
                    )
                    .map(changeRequest => (
                        <DraftBannerContent
                            key={changeRequest.id}
                            changeRequest={changeRequest}
                            onClick={() => {
                                setIsSidebarOpen(true);
                            }}
                        />
                    ))}

            <ChangeRequestSidebar
                project={project}
                open={isSidebarOpen}
                onClose={() => {
                    setIsSidebarOpen(false);
                }}
            />
        </StickyBanner>
    );
};
