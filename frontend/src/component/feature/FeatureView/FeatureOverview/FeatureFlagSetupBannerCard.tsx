import type { ReactNode } from 'react';
import { Button, styled, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

const BannerCard = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    paddingRight: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const IconBox = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.common.white,
}));

const ContentRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(2),
    alignItems: 'flex-end',
    justifyContent: 'space-between',
}));

const TextContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
});

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const PendingBadge = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const PendingDot = styled('span')(({ theme }) => ({
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
}));

interface FeatureFlagSetupBannerCardProps {
    title: string;
    description: ReactNode;
    buttonLabel: string;
    onButtonClick: () => void;
}

export const FeatureFlagSetupBannerCard = ({
    title,
    description,
    buttonLabel,
    onButtonClick,
}: FeatureFlagSetupBannerCardProps) => (
    <BannerCard>
        <IconBox>
            <CodeIcon />
        </IconBox>
        <ContentRow>
            <TextContainer>
                <TitleRow>
                    <Typography
                        variant='body1'
                        fontWeight='bold'
                        color='text.primary'
                    >
                        {title}
                    </Typography>
                    <PendingBadge>
                        <PendingDot />
                        <Typography variant='caption' color='warning.main'>
                            Pending
                        </Typography>
                    </PendingBadge>
                </TitleRow>
                <Typography variant='body2' color='text.secondary'>
                    {description}
                </Typography>
            </TextContainer>
            <Button variant='contained' onClick={onButtonClick}>
                {buttonLabel}
            </Button>
        </ContentRow>
    </BannerCard>
);
