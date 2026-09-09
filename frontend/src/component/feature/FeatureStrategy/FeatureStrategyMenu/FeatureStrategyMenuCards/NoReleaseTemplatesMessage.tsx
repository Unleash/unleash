import { Box, styled } from '@mui/material';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import { QuietLink } from 'component/common/QuietLink';

const StyledIcon = styled('span', {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    '& > svg': {
        fill: theme.palette.primary.main,
        width: theme.spacing(6),
        height: theme.spacing(6),
        ...(solo && {
            width: theme.spacing(10),
            height: theme.spacing(10),
        }),
    },
    display: 'flex',
    alignItems: 'center',
}));

const StyledContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral.container,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    width: 'auto',
    ...(solo && {
        backgroundColor: undefined,
        flexDirection: 'column',
        maxWidth: theme.spacing(70),
        margin: 'auto',
        gap: theme.spacing(2.5),
    }),
}));

const StyledBody = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'solo',
})<{ solo?: boolean }>(({ theme, solo }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    fontSize: theme.typography.caption.fontSize,
    ...(solo && {
        alignItems: 'center',
        textAlign: 'center',
        gap: theme.spacing(2),
        fontSize: theme.typography.body2.fontSize,
    }),
}));

const StyledTitle = styled('p')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface INoReleaseTemplatesMessageProps {
    solo?: boolean;
}

export const NoReleaseTemplatesMessage = ({
    solo,
}: INoReleaseTemplatesMessageProps) => (
    <StyledContainer solo={solo}>
        <StyledIcon solo={solo}>
            <ReleaseTemplateIcon />
        </StyledIcon>
        <StyledBody solo={solo}>
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
