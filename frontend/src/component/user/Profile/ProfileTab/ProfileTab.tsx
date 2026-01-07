import { useEffect, useId, useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    type SelectChangeEvent,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { IUser } from 'interfaces/user';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { Link } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { RoleBadge } from 'component/common/RoleBadge/RoleBadge';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProductivityEmailSubscription } from './ProductivityEmailSubscription.tsx';
import { formatDateYMDHM } from 'utils/formatDate.ts';
import { defaultLocales } from '../../../../constants/defaultLocales.ts';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(6),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.alternative,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(3),
    boxShadow: theme.boxShadows.primaryHeader,
}));

const StyledInfo = styled('div')(() => ({
    flexGrow: 1,
}));

const StyledInfoName = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(3.75),
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(9.5),
    height: theme.spacing(9.5),
    marginRight: theme.spacing(3),
}));

const StyledSectionLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(3),
}));

const StyledAccess = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    '& > div > p': {
        marginBottom: theme.spacing(1.5),
    },
}));

const StyledBadgeLink = styled(Link)(({ theme }) => ({
    ':hover,:focus-visible': {
        outline: 'none',
        '> *': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
    },
}));

const StyledDivider = styled('div')(({ theme }) => ({
    width: '100%',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(3, 0),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    width: theme.spacing(30),
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

interface IProfileTabProps {
    user: IUser;
}

const ProjectList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
}));

const exampleDateString = '2014-09-29T14:50:46';
const exampleDate = new Date(exampleDateString);

const LocaleSelector = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

export const ProfileTab = ({ user }: IProfileTabProps) => {
    const { profile, refetchProfile } = useProfile();
    const { locationSettings, setLocationSettings } = useLocationSettings();
    const [currentLocale, setCurrentLocale] = useState<string>();
    const exampleDateId = useId();

    const [possibleLocales, setPossibleLocales] = useState<string[]>([
        ...defaultLocales,
    ]);

    useEffect(() => {
        const found = possibleLocales.find((locale) =>
            locale
                .toLowerCase()
                .includes(locationSettings.locale.toLowerCase()),
        );
        setCurrentLocale(found);
        if (!found) {
            setPossibleLocales((prev) => [...prev, locationSettings.locale]);
        }
    }, [locationSettings]);

    const changeLocale = (e: SelectChangeEvent) => {
        const locale = e.target.value;
        setCurrentLocale(locale);
        setLocationSettings({ locale });
    };

    const productivityReportEmailEnabled = useUiFlag('productivityReportEmail');

    return (
        <>
            <StyledHeader>
                <StyledAvatar user={user} />
                <StyledInfo>
                    <StyledInfoName>
                        {user.name || user.email || user.username}
                    </StyledInfoName>
                    <Typography variant='body1'>{user.email}</Typography>
                </StyledInfo>
            </StyledHeader>
            <PageContent>
                <StyledSectionLabel>Access</StyledSectionLabel>
                <StyledAccess>
                    <Box sx={{ width: '50%' }}>
                        {profile?.rootRole && (
                            <>
                                <Typography variant='body2'>
                                    Your root role
                                </Typography>
                                <RoleBadge roleId={profile.rootRole.id}>
                                    {profile.rootRole.name}
                                </RoleBadge>
                            </>
                        )}
                    </Box>
                    <Box>
                        <Typography variant='body2'>Projects</Typography>
                        <ConditionallyRender
                            condition={Boolean(profile?.projects.length)}
                            show={
                                <ProjectList>
                                    {profile?.projects.map((project) => (
                                        <li key={project}>
                                            <Tooltip
                                                title='View project'
                                                arrow
                                                placement='bottom-end'
                                                describeChild
                                            >
                                                <StyledBadgeLink
                                                    to={`/projects/${project}`}
                                                >
                                                    <Badge
                                                        color='secondary'
                                                        icon={
                                                            <TopicOutlinedIcon />
                                                        }
                                                    >
                                                        {project}
                                                    </Badge>
                                                </StyledBadgeLink>
                                            </Tooltip>
                                        </li>
                                    ))}
                                </ProjectList>
                            }
                            elseShow={
                                <Tooltip
                                    title='You are not assigned to any projects'
                                    arrow
                                    describeChild
                                >
                                    <Badge tabIndex={0}>No projects</Badge>
                                </Tooltip>
                            }
                        />
                    </Box>
                </StyledAccess>
                <StyledDivider />
                <StyledSectionLabel>Date/Time Settings</StyledSectionLabel>
                <Typography variant='body2'>
                    This is the format used across the system for time and date
                </Typography>
                <LocaleSelector>
                    <StyledFormControl variant='outlined' size='small'>
                        <StyledInputLabel htmlFor='locale-select'>
                            Date/Time formatting
                        </StyledInputLabel>
                        <Select
                            aria-details={exampleDateId}
                            id='locale-select'
                            value={currentLocale || ''}
                            native
                            onChange={changeLocale}
                            MenuProps={{
                                style: {
                                    zIndex: 9999,
                                },
                            }}
                        >
                            {possibleLocales.map((locale) => {
                                return (
                                    <option key={locale} value={locale}>
                                        {locale}
                                    </option>
                                );
                            })}
                        </Select>
                    </StyledFormControl>
                    <Typography id={exampleDateId}>
                        Example:{' '}
                        <time dateTime={exampleDateString}>
                            {formatDateYMDHM(exampleDate, currentLocale)}
                        </time>
                    </Typography>
                </LocaleSelector>
                {productivityReportEmailEnabled ? (
                    <>
                        <StyledDivider />
                        <StyledSectionLabel>Email Settings</StyledSectionLabel>
                        {profile?.subscriptions && (
                            <ProductivityEmailSubscription
                                status={
                                    profile.subscriptions.includes(
                                        'productivity-report',
                                    )
                                        ? 'subscribed'
                                        : 'unsubscribed'
                                }
                                onChange={refetchProfile}
                            />
                        )}
                    </>
                ) : null}
            </PageContent>
        </>
    );
};
