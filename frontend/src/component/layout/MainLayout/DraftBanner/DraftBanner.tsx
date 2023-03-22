import { FC, useState, VFC } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestSidebar } from 'component/changeRequest/ChangeRequestSidebar/ChangeRequestSidebar';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import { changesCount } from 'component/changeRequest/changesCount';

interface IDraftBannerProps {
    project: string;
}

const DraftBannerContentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(1, 2),
    },
}));

const StyledBox = styled(Box)(({ theme }) => ({
    width: '1250px',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.down('lg')]: {
        width: '1024px',
    },
    [theme.breakpoints.down(1024)]: {
        width: '100%',
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
}));

const DraftBannerContent: FC<{
    changeRequest: IChangeRequest;
    onClick: () => void;
}> = ({ changeRequest, onClick }) => {
    return (
        <StyledBox>
            <DraftBannerContentWrapper>
                <Typography variant="body2" sx={{ mr: 4 }}>
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
        </StyledBox>
    );
};

const StickyBanner = styled(Box)(({ theme }) => ({
    position: 'sticky',
    top: -1,
    zIndex: 250 /* has to lower than header.zIndex and higher than body.zIndex */,
    borderTop: `1px solid ${theme.palette.warning.border}`,
    borderBottom: `1px solid ${theme.palette.warning.border}`,
    color: theme.palette.warning.contrastText,
    backgroundColor: theme.palette.warning.light,
}));

export const DraftBanner: VFC<IDraftBannerProps> = ({ project }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data, loading } = usePendingChangeRequests(project);

    if ((!loading && !data) || data?.length === 0) {
        return null;
    }

    return (
        <StickyBanner>
            {data?.length
                ? data
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
                      ))
                : null}

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
