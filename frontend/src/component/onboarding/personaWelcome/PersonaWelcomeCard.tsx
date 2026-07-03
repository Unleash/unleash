import { useState, type FC } from 'react';
import {
    Button,
    Chip,
    IconButton,
    MenuItem,
    styled,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    companyRoles,
    type CompanyRole,
    readPersonaOverride,
    resolvePersona,
    writePersonaOverride,
} from './persona.ts';

const isKnownRole = (role: string): role is CompanyRole =>
    (companyRoles as readonly string[]).includes(role);

const StyledContainer = styled('article')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 4),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'none',
    position: 'relative',
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    paddingRight: theme.spacing(4),
}));

const StyledTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
}));

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const StyledPersonaSelect = styled(TextField)(({ theme }) => ({
    minWidth: theme.spacing(25),
}));

const TechnicalActions: FC<{ projectId: string }> = ({ projectId }) => (
    <StyledActions>
        <Button
            component={Link}
            nativeButton={false}
            to={`/projects/${projectId}`}
            variant='contained'
        >
            Create a flag
        </Button>
        <Button
            component={Link}
            nativeButton={false}
            to={`/projects/${projectId}`}
            variant='outlined'
        >
            Connect an SDK
        </Button>
        <Button
            href='https://docs.getunleash.io/sdks'
            target='_blank'
            rel='noopener noreferrer'
        >
            View SDK docs
        </Button>
    </StyledActions>
);

const ProductActions: FC = () => (
    <StyledActions>
        <Button
            component={Link}
            nativeButton={false}
            to='/admin/invite-link'
            variant='contained'
        >
            Invite a developer
        </Button>
        <Button
            component={Link}
            nativeButton={false}
            to='/playground'
            variant='outlined'
        >
            Explore a gradual rollout
        </Button>
        <Button
            href='https://docs.getunleash.io/guides/getting-started-release-management'
            target='_blank'
            rel='noopener noreferrer'
        >
            Release management overview
        </Button>
    </StyledActions>
);

export const PersonaWelcomeCard: FC = () => {
    const personaOnboardingEnabled = useUiFlag('personaOnboarding');
    const { user } = useAuthUser();
    const { personalDashboard } = usePersonalDashboard();
    const [override, setOverride] = useState(readPersonaOverride);
    const [cardState, setCardState] = useLocalStorageState<'open' | 'closed'>(
        'persona-welcome:v1',
        'open',
    );

    if (!personaOnboardingEnabled || cardState === 'closed') {
        return null;
    }

    const companyRole = override || user?.companyRole || '';
    const persona = resolvePersona(companyRole);
    const projectId = personalDashboard?.projects[0]?.id ?? 'default';

    const onPersonaChange = (companyRole: string) => {
        writePersonaOverride(companyRole);
        setOverride(companyRole);
    };

    return (
        <StyledContainer>
            <Tooltip title='Dismiss' arrow>
                <StyledCloseButton
                    aria-label='dismiss'
                    onClick={() => setCardState('closed')}
                    size='small'
                >
                    <CloseIcon />
                </StyledCloseButton>
            </Tooltip>
            <StyledHeader>
                <StyledTitle>
                    {persona === 'product'
                        ? 'See how Unleash de-risks your releases — no code needed'
                        : 'Get a flag working in your code in minutes'}
                </StyledTitle>
                <Tooltip
                    title={
                        companyRole
                            ? `Based on your role: ${companyRole}`
                            : 'No role set; showing the developer experience'
                    }
                    arrow
                >
                    <Chip
                        size='small'
                        label={
                            persona === 'product'
                                ? 'Product persona'
                                : 'Developer persona'
                        }
                    />
                </Tooltip>
            </StyledHeader>
            <Typography variant='body2'>
                {persona === 'product'
                    ? 'Feature flags let you roll out gradually, test in production safely, and roll back instantly. Try it hands-on — no SDK setup required.'
                    : 'Create your first feature flag, connect an SDK, and control your code from Unleash — all in a few minutes.'}
            </Typography>
            {persona === 'product' ? (
                <ProductActions />
            ) : (
                <TechnicalActions projectId={projectId} />
            )}
            <StyledFooter>
                <StyledPersonaSelect
                    select
                    size='small'
                    label='Not your role?'
                    value={isKnownRole(companyRole) ? companyRole : ''}
                    onChange={(event) => onPersonaChange(event.target.value)}
                >
                    {companyRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                </StyledPersonaSelect>
            </StyledFooter>
        </StyledContainer>
    );
};
