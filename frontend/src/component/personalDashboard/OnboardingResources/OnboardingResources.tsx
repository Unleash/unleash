import { useId, type ReactNode } from 'react';
import {
    alpha,
    Button,
    type ButtonProps,
    Paper,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import OpenInNew from '@mui/icons-material/OpenInNew';
import EnterpriseBadge from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import { Badge } from 'component/common/Badge/Badge';
import { EnterpriseBenefits } from '../EnterpriseBenefits.tsx';

const StyledResources = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${theme.spacing(35)}), 1fr))`,
    gap: theme.spacing(2),
}));

const StyledCard = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(3),
    minHeight: theme.spacing(28),
    minWidth: 0,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledButton = styled(Button)<ButtonProps<'a'>>(({ theme }) => ({
    borderColor: theme.palette.divider,
}));

const ResourceButton = ({
    href,
    children,
    color = 'primary',
}: {
    href: string;
    children: ReactNode;
    color?: ButtonProps['color'];
}) => (
    <StyledButton
        target='_blank'
        rel='noopener noreferrer'
        variant='outlined'
        size='medium'
        endIcon={<OpenInNew />}
        href={href}
        color={color}
    >
        {children}
    </StyledButton>
);

const ResourceCard = ({
    title,
    icon,
    children,
    links,
    className,
}: {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    links: ReactNode;
    className?: string;
}) => {
    const headingId = useId();
    return (
        <StyledCard
            className={className}
            variant='outlined'
            role='region'
            aria-labelledby={headingId}
        >
            {icon}
            <Typography
                id={headingId}
                component='h3'
                variant='body1'
                sx={{ fontWeight: 'bold' }}
            >
                {title}
            </Typography>
            <Typography component='div' variant='body2' color='text.secondary'>
                {children}
            </Typography>
            <Stack
                direction='row'
                useFlexGap
                spacing={1}
                sx={{ mt: 'auto', pt: 1, flexWrap: 'wrap' }}
            >
                {links}
            </Stack>
        </StyledCard>
    );
};

const StyledAlternativeCard = styled(ResourceCard)(({ theme }) => ({
    backgroundColor: theme.palette.web.main,
    color: theme.palette.web.contrastText,
    borderColor: theme.palette.web.main,
    '& .MuiTypography-body2': { color: 'inherit' },
    '& .MuiButton-root': {
        borderColor: alpha(theme.palette.common.white, 0.25),
    },
}));

export const DashboardHelpCard = () => (
    <ResourceCard
        title='Need help?'
        icon={<HelpOutlineOutlined color='primary' />}
        links={
            <>
                <ResourceButton href='https://docs.getunleash.io/'>
                    Go to docs
                </ResourceButton>
                <ResourceButton href='https://docs.getunleash.io/get-started/unleash-overview'>
                    View architecture
                </ResourceButton>
                <ResourceButton href='https://learning.getunleash.io/'>
                    Learning lab
                </ResourceButton>
            </>
        }
    >
        Here are some resources to help you get started with Unleash.
    </ResourceCard>
);

export const DashboardImportCard = ({
    edition,
}: {
    edition: 'oss' | 'enterprise';
}) =>
    edition === 'oss' ? (
        <StyledAlternativeCard
            title='Get unlimited projects and environments'
            icon={
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <EnterpriseBadge aria-hidden />
                    <Badge color='primary' sx={{ textTransform: 'uppercase' }}>
                        Try Unleash Enterprise
                    </Badge>
                </Stack>
            }
            links={
                <ResourceButton
                    color='inherit'
                    href='https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=dashboard'
                >
                    View full Enterprise offering
                </ResourceButton>
            }
        >
            <EnterpriseBenefits />
        </StyledAlternativeCard>
    ) : (
        <StyledAlternativeCard
            title='Import from open source?'
            icon={<FileDownloadOutlined />}
            links={
                <ResourceButton
                    color='inherit'
                    href='https://docs.getunleash.io/guides/migrate-from-open-source'
                >
                    Import from OSS
                </ResourceButton>
            }
        >
            Already running Unleash OSS? Import your existing projects and flags
            and pick up where you left off.
        </StyledAlternativeCard>
    );

export const OnboardingResources = ({
    edition,
}: {
    edition: 'oss' | 'enterprise';
}) => (
    <StyledResources>
        <DashboardHelpCard />
        <DashboardImportCard edition={edition} />
    </StyledResources>
);
