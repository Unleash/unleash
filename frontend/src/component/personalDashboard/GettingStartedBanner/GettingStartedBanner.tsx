import { useId } from 'react';
import { Button, Paper, Stack, styled, Typography } from '@mui/material';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router';
import copy from 'copy-to-clipboard';
import { Badge } from 'component/common/Badge/Badge';
import useToast from 'hooks/useToast';
import { getSetupPrompt, type SetupPromptContext } from './getSetupPrompt.ts';
import illustration from 'assets/img/Legal.png';
import { formatAssetPath } from 'utils/formatPath';

const StyledBanner = styled(Paper)(({ theme }) => ({
    containerType: 'inline-size',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledLayout = styled('div')({
    display: 'grid',
    '@container (min-width: 720px)': {
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
    },
});

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
}));

const StyledIllustration = styled('img')(({ theme }) => ({
    display: 'none',
    position: 'absolute',
    top: '-8%',
    right: theme.spacing(2),
    height: '115%',
    width: 'auto',
    '@container (min-width: 720px)': { display: 'block' },
}));

interface GettingStartedBannerProps {
    instanceUrl: string;
    projectId: string;
    promptContext?: SetupPromptContext;
}

export const GettingStartedBanner = ({
    instanceUrl,
    projectId,
    promptContext,
}: GettingStartedBannerProps) => {
    const headingId = useId();
    const { setToastData } = useToast();

    const copySetupPrompt = () => {
        if (copy(getSetupPrompt(instanceUrl, projectId, promptContext))) {
            setToastData({
                type: 'success',
                text: 'Setup prompt copied. Paste it into your coding agent.',
            });
        } else {
            setToastData({
                type: 'error',
                text: 'Could not copy the setup prompt. Please try again.',
            });
        }
    };

    return (
        <StyledBanner
            variant='outlined'
            role='region'
            aria-labelledby={headingId}
        >
            <StyledLayout>
                <StyledContent>
                    <Badge color='primary' icon={<AutoAwesomeOutlined />}>
                        Get started with AI
                    </Badge>
                    <Typography id={headingId} component='h2' variant='h2'>
                        Create and connect your first flag
                    </Typography>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ maxWidth: '70ch' }}
                    >
                        Let your AI coding agent connect Unleash to your
                        application or build a demo. Copy the prompt and paste
                        it into an agent with access to your local files.
                    </Typography>
                    <Stack
                        direction='row'
                        useFlexGap
                        spacing={2}
                        sx={{ flexWrap: 'wrap', mt: 1 }}
                    >
                        <Button
                            variant='contained'
                            size='medium'
                            endIcon={<ContentCopyOutlined />}
                            onClick={copySetupPrompt}
                        >
                            Copy setup prompt
                        </Button>
                        <Button
                            component={Link}
                            nativeButton={false}
                            to={`/projects/${encodeURIComponent(projectId)}?create=true`}
                            variant='outlined'
                            size='medium'
                            endIcon={<ArrowForward />}
                        >
                            Create flag manually
                        </Button>
                    </Stack>
                </StyledContent>
                <StyledIllustration
                    src={formatAssetPath(illustration)}
                    alt=''
                />
            </StyledLayout>
        </StyledBanner>
    );
};
