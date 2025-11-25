import {
    Button,
    type ButtonProps,
    styled,
    Typography,
    type TypographyProps,
} from '@mui/material';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import { Link } from 'react-router-dom';

const Container = styled('article')(({ theme }) => ({
    paddingBlock: theme.spacing(5),
    display: 'flex',
    gap: theme.spacing(2),
    flexFlow: 'column nowrap',
    alignItems: 'center',
    maxWidth: theme.spacing(40),
    margin: 'auto',
}));

const CenteredText = styled(Typography)<TypographyProps>({
    textAlign: 'center',
});

const Buttons = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(2),
    justifyContent: 'center',
}));

const LinkButton = styled((props: ButtonProps<typeof Link>) => (
    <Button component={Link} {...props} />
))({
    whiteSpace: 'nowrap',
});

export const EmptyTemplatesListMessage = () => {
    return (
        <Container>
            <ReleaseTemplateIcon />
            <CenteredText component='h2' variant='h3'>
                Get started with release templates
            </CenteredText>
            <CenteredText component='p' sx={{ color: 'text.secondary' }}>
                Control your releases with milestones that can be reused by the
                entire team.
            </CenteredText>
            <Buttons>
                <LinkButton
                    to='https://docs.getunleash.io/reference/release-templates'
                    variant='text'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Read docs
                </LinkButton>
                <LinkButton
                    to='/release-templates/create-template'
                    variant='contained'
                >
                    New template
                </LinkButton>
            </Buttons>
        </Container>
    );
};
