import { Button, styled, Typography } from '@mui/material';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Link, useNavigate } from 'react-router-dom';

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

export const EmptyTemplatesListMessage = () => {
    const navigate = useNavigate();
    return (
        <Container>
            <ReleaseTemplateIcon />
            <Typography component='h2' variant='h3'>
                Get started with release templates
            </Typography>
            <Typography component='p' color='text.secondary'>
                Control your releases with milestones that can be reused by the
                entire team.
            </Typography>
            <Buttons>
                <Button
                    component={Link}
                    sx={{ whiteSpace: 'nowrap' }}
                    to='https://docs.getunleash.io/reference/release-templates'
                    variant='text'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Read docs
                </Button>
                <PermissionButton
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                        navigate('/release-templates/create-template');
                    }}
                    permission={RELEASE_PLAN_TEMPLATE_CREATE}
                >
                    New template
                </PermissionButton>
            </Buttons>
        </Container>
    );
};
