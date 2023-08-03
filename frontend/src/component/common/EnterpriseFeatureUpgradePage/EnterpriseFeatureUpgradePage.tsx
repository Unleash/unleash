import { VFC } from 'react';
import { Box, Button, Typography, styled } from '@mui/material';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { PageContent } from '../PageContent/PageContent';
import { PageHeader } from '../PageHeader/PageHeader';

type EnterpriseFeatureUpgradePageProps = {
    title: string;
    link: string;
};

const StyledContainer = styled(Box)(({ theme }) => ({
    background: theme.palette.background.elevation2,
    padding: theme.spacing(8, 2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
}));

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    paddingRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

export const EnterpriseFeatureUpgradePage: VFC<EnterpriseFeatureUpgradePageProps> = ({
    title,
    link,
}) => (
    <PageContent header={<PageHeader title={title} />}>
        <StyledContainer>
            <StyledHeader variant="h2">
                <StyledBadgeContainer>
                    <EnterpriseBadge size={24} />
                </StyledBadgeContainer>
                Enterprise feature
            </StyledHeader>
            <Typography variant="body1">
                <a href={link}>{title}</a> is a feature available for the
                Enterprise plan.
            </Typography>
            <Typography variant="body1">
                You need to upgrade your plan if you want to use it.
            </Typography>
            <Button
                component="a"
                href="https://www.getunleash.io/plans/enterprise"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                sx={theme => ({ marginTop: theme.spacing(5) })}
            >
                Upgrade now
            </Button>
        </StyledContainer>
    </PageContent>
);
