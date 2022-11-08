import { FC, useState, VFC } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useStyles as useAppStyles } from 'component/App.styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestSidebar } from '../ChangeRequestSidebar/ChangeRequestSidebar';
import { useChangeRequestOpen } from 'hooks/api/getters/useChangeRequestOpen/useChangeRequestOpen';
import { IChangeRequest } from '../changeRequest.types';

interface IDraftBannerProps {
    project: string;
}

const DraftBannerContent: FC<{
    changeRequest: IChangeRequest;
    onClick: () => void;
}> = ({ changeRequest, onClick }) => {
    const { classes } = useAppStyles();

    return (
        <Box className={classes.content}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 1.5,
                    color: theme => theme.palette.warning.main,
                }}
            >
                <WarningAmberIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                    <strong>Draft mode!</strong> – You have changes{' '}
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
                </Typography>
                <Button
                    variant="contained"
                    onClick={onClick}
                    sx={{ ml: 'auto' }}
                >
                    Review changes
                </Button>
                <Button variant="text" onClick={() => {}} sx={{ ml: 1 }}>
                    Discard all
                </Button>
            </Box>
        </Box>
    );
};

export const DraftBanner: VFC<IDraftBannerProps> = ({ project }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { draft, loading } = useChangeRequestOpen(project);

    if ((!loading && !draft) || draft?.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'sticky',
                top: -1,
                zIndex: theme => theme.zIndex.appBar,
                borderTop: theme => `1px solid ${theme.palette.warning.border}`,
                borderBottom: theme =>
                    `1px solid ${theme.palette.warning.border}`,
                backgroundColor: theme => theme.palette.warning.light,
            }}
        >
            {draft &&
                draft
                    .filter(changeRequest =>
                        ['Draft', 'In review'].includes(changeRequest.state)
                    )
                    .map(changeRequest => (
                        <DraftBannerContent
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
        </Box>
    );
};
