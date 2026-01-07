import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { StyledProjectCard, StyledProjectCardBody } from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter.tsx';
import upgradeProjects from 'assets/img/upgradeProjects.png';
import { formatAssetPath } from 'utils/formatPath';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1, 0.5, 2),
    height: 53,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.75),
    right: theme.spacing(0.75),
}));

const StyledInfo = styled('a')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    textDecoration: 'none',
    color: 'inherit',
    height: '100%',
    paddingTop: theme.spacing(0.5),
}));

const StyledImage = styled('img')(({ theme }) => ({
    width: 95,
    margin: theme.spacing(1),
}));

export const UpgradeProjectCard = () => {
    const [moreProjectsUpgrade, setMoreProjectsUpgrade] = useLocalStorageState<
        'open' | 'closed'
    >('upgrade-projects:v1', 'open');

    if (moreProjectsUpgrade === 'closed') {
        return null;
    }

    const onDismiss = () => {
        setMoreProjectsUpgrade('closed');
    };

    return (
        <StyledProjectCard>
            <StyledProjectCardBody>
                <Tooltip title='Dismiss' arrow>
                    <StyledCloseButton
                        aria-label='dismiss'
                        onClick={onDismiss}
                        size='small'
                    >
                        <CloseIcon fontSize='inherit' />
                    </StyledCloseButton>
                </Tooltip>
                <StyledInfo
                    href='https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=projects'
                    target='_blank'
                >
                    <Typography component='span' fontWeight='bold'>
                        More{' '}
                        <Typography
                            component='span'
                            color='secondary'
                            fontWeight='bold'
                        >
                            projects
                        </Typography>{' '}
                        –
                        <br />
                        easy collaboration
                    </Typography>
                    <StyledImage
                        src={formatAssetPath(upgradeProjects)}
                        alt='Upgrade projects'
                    />
                </StyledInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter>
                <StyledFooter>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        lineHeight={1.2}
                    >
                        Get unlimited projects, and scale Unleash in your
                        organization
                    </Typography>
                    <IconButton
                        color='primary'
                        href='https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=projects'
                        target='_blank'
                    >
                        <ArrowForwardIcon />
                    </IconButton>
                </StyledFooter>
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
