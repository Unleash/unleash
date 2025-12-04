import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';
import ExtensionOutlined from '@mui/icons-material/ExtensionOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';

interface IProjectOnboardedProps {
    projectId: string;
    onClose: () => void;
}

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    flexBasis: '70%',
    borderRadius: theme.shape.borderRadiusLarge,
}));

const TitleRow = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 4, 2, 7),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing(3),
    alignItems: 'center',
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(3, 2, 6, 8),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const Title = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
}));

const StyledCheck = styled(Check)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
    borderRadius: '50%',
    padding: theme.spacing(0.5),
    width: '28px',
    height: '28px',
}));

const ColoredExtension = styled(ExtensionOutlined)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const ColoredPeople = styled(PeopleOutlined)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const ColoredMenuBook = styled(MenuBookOutlined)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const ProjectOnboarded = ({
    projectId,
    onClose,
}: IProjectOnboardedProps) => {
    return (
        <Container>
            <TitleRow>
                <StyledCheck />
                <Title>
                    <Typography fontWeight='bold'>Setup completed</Typography>
                    <Typography variant='body2'>Next steps</Typography>
                </Title>

                <Tooltip title='Close' arrow sx={{ ml: 'auto' }}>
                    <IconButton onClick={onClose} size='small'>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </TitleRow>
            <Actions>
                <ActionBox>
                    <TitleContainer>
                        <ColoredExtension />
                        Expose your feature flag to users
                    </TitleContainer>
                    <Typography>
                        You can have fine grained control over who is exposed to
                        your feature flag by leveraging{' '}
                        <Link
                            className='unleash-action-button'
                            to={`https://docs.getunleash.io/concepts/activation-strategies`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            strategies
                        </Link>
                        . Visit the feature flag page to start adding strategies
                        to control exposure.
                    </Typography>
                </ActionBox>
                <ActionBox>
                    <TitleContainer>
                        <ColoredPeople />
                        Add members to your project
                    </TitleContainer>
                    <Typography>
                        Unleash is best when collaborating with your co-workers.{' '}
                        <Link
                            className='unleash-action-button'
                            to={`/projects/${projectId}/settings/access`}
                        >
                            Add your co-workers to the project
                        </Link>
                        .
                    </Typography>
                </ActionBox>
                <ActionBox>
                    <TitleContainer>
                        <ColoredMenuBook />
                        Learn about Unleash
                    </TitleContainer>
                    <Typography>
                        Take a deep dive through our documentation,{' '}
                        <Link
                            className='unleash-action-button'
                            to={`https://docs.getunleash.io/unleash-academy/foundational`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            starting with the foundations of Unleash
                        </Link>
                        .
                    </Typography>
                </ActionBox>
            </Actions>
        </Container>
    );
};
