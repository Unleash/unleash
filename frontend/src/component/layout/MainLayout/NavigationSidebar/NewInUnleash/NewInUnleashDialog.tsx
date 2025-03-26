import OpenInNew from '@mui/icons-material/OpenInNew';
import {
    Badge,
    Box,
    Button,
    ClickAwayListener,
    Dialog,
    IconButton,
    Link,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { Link as RouterLink } from 'react-router-dom';
import type { FC, ReactNode } from 'react';
import Close from '@mui/icons-material/Close';

const StyledLargeHeader = styled(Typography)(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.text.primary,
    margin: 0,
}));

const StyledPreHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.neutral.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    padding: 0,
    marginBottom: theme.spacing(0.5),
}));

const StyledMainTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: 0,
    lineHeight: 1.2,
}));

const StyledLink = styled(Link<typeof RouterLink | 'a'>)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: 0,
    color: theme.palette.links,
    fontWeight: theme.typography.fontWeightBold,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledOpenInNew = styled(OpenInNew)(({ theme }) => ({
    fontSize: theme.spacing(2.25),
}));

const CenteredPreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '> svg': { display: 'block', width: '100%', height: 'auto' },
}));

const LongDescription = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    ul: {
        margin: 0,
        paddingLeft: theme.spacing(2),
    },
}));

const ReadMore = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
}));

const StyledCheckItOutButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const DialogCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(4),
    margin: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    boxShadow: theme.shadows[5],
    maxWidth: theme.spacing(150),
    width: '100%',
    height: '100%',
    overflow: 'auto',
}));

const StyledDialog = styled(Dialog)(() => ({
    '& .MuiDialog-paper': {
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'none',
        overflow: 'visible',
    },
}));

const BottomActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: theme.spacing(3),
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const StyledItemButtonClose = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.25),
}));

export const NewInUnleashDialog: FC<{
    title: string;
    longDescription: ReactNode;
    docsLink?: string;
    onCheckItOut?: () => void;
    open: boolean;
    preview?: ReactNode;
    onClose: () => void;
    beta: boolean;
}> = ({
    title,
    longDescription,
    onCheckItOut,
    docsLink,
    preview,
    open,
    onClose,
    beta,
}) => (
    <StyledDialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
        <ClickAwayListener onClickAway={onClose}>
            <DialogCard>
                <Tooltip title='Dismiss' arrow sx={{ marginLeft: 'auto' }}>
                    <StyledItemButtonClose
                        aria-label='dismiss'
                        onClick={(e) => {
                            onClose();
                            e.stopPropagation();
                        }}
                        size='small'
                    >
                        <Close fontSize='inherit' />
                    </StyledItemButtonClose>
                </Tooltip>

                <StyledPreHeader>New in Unleash</StyledPreHeader>

                <StyledMainTitle>
                    <StyledLargeHeader>{title}</StyledLargeHeader>
                    <ConditionallyRender
                        condition={beta}
                        show={<Badge color='secondary'>Beta</Badge>}
                    />
                </StyledMainTitle>

                <LongDescription>{longDescription}</LongDescription>

                <ConditionallyRender
                    condition={Boolean(preview)}
                    show={<CenteredPreview>{preview}</CenteredPreview>}
                />

                <BottomActions>
                    <ConditionallyRender
                        condition={Boolean(docsLink)}
                        show={
                            <ReadMore>
                                <StyledLink
                                    component='a'
                                    href={docsLink}
                                    underline='hover'
                                    rel='noopener noreferrer'
                                    target='_blank'
                                >
                                    <StyledOpenInNew />
                                    Read more in our documentation
                                </StyledLink>
                            </ReadMore>
                        }
                    />

                    <ConditionallyRender
                        condition={Boolean(onCheckItOut)}
                        show={
                            <StyledCheckItOutButton
                                variant='contained'
                                color='primary'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onClose();
                                    onCheckItOut?.();
                                }}
                            >
                                Get Started
                            </StyledCheckItOutButton>
                        }
                    />
                </BottomActions>
            </DialogCard>
        </ClickAwayListener>
    </StyledDialog>
);
