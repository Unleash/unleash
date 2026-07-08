import { Button, styled, Typography } from '@mui/material';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Link, useNavigate } from 'react-router';

const Container = styled('article')(({ theme }) => ({
    paddingBlock: theme.spacing(5),
    display: 'flex',
    gap: theme.spacing(2),
    flexFlow: 'column nowrap',
    alignItems: 'center',
    maxWidth: theme.spacing(40),
    margin: 'auto',
    textAlign: 'center',
}));

const Buttons = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(2),
    justifyContent: 'center',
}));

export const EmptyTemplatesListMessage = ({
    createPath = '/release-templates/create-template',
    projectId,
}: {
    createPath?: string;
    projectId?: string;
}) => {
    const navigate = useNavigate();
    return (
        <Container>
            <ReleaseTemplateIcon />
            <Typography component='h2' variant='h3'>
                Get started with release templates
            </Typography>
            <Typography
                component='p'
                sx={{
                    color: 'text.secondary',
                }}
            >
                Control your releases with milestones that can be reused by the
                entire team.
            </Typography>
            <Buttons>
                <Button
                    component={Link}
                    nativeButton={false}
                    sx={{ whiteSpace: 'nowrap' }}
                    to='https://docs.getunleash.io/concepts/release-templates'
                    variant='text'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Read docs
                </Button>
                <PermissionButton
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                        navigate(createPath);
                    }}
                    permission={[
                        RELEASE_PLAN_TEMPLATE_CREATE,
                        UPDATE_PROJECT_RELEASE_TEMPLATE,
                    ]}
                    projectId={projectId}
                >
                    New template
                </PermissionButton>
            </Buttons>
        </Container>
    );
};
