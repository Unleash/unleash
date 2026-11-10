import { Box, styled } from '@mui/material';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import { QuietLink } from 'component/common/QuietLink';

const StyledIcon = styled('span')(({ theme }) => ({
    '& > svg': {
        fill: theme.palette.primary.main,
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
    display: 'flex',
    alignItems: 'center',
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    gap: theme.spacing(2.5),
    width: 'auto',
    maxWidth: theme.spacing(70),
    margin: 'auto',
}));

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
}));

const StyledTitle = styled('p')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

export const NoReleaseTemplatesMessage = () => (
    <StyledContainer>
        <StyledIcon>
            <ReleaseTemplateIcon />
        </StyledIcon>
        <StyledBody>
            <StyledTitle>
                You don't have any release templates set up yet
            </StyledTitle>
            <StyledDescription>
                Go to{' '}
                <QuietLink to='/release-templates'>
                    Configure &gt; Release templates
                </QuietLink>{' '}
                in the side menu to make your rollouts more efficient and
                streamlined. Read more in our{' '}
                <QuietLink
                    to='https://docs.getunleash.io/concepts/release-templates'
                    target='_blank'
                    rel='noreferrer'
                >
                    documentation
                </QuietLink>
                .
            </StyledDescription>
        </StyledBody>
    </StyledContainer>
);
