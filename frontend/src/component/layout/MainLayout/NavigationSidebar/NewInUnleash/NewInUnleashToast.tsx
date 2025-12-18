import {
    IconButton,
    Slide,
    Snackbar,
    styled,
    Typography,
    type TypographyProps,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewReleases from '@mui/icons-material/NewReleases';
import Close from '@mui/icons-material/Close';
import { NewInUnleashDialog } from './NewInUnleashDialog.tsx';
import type { NewInUnleashItem } from './NewInUnleashItems.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

const SvgWrapper = styled('span')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    '::before': {
        content: '" "',
        position: 'absolute',
        borderRadius: '50%',
        top: '15%',
        left: '15%',
        width: '70%',
        height: '70%',
        display: 'block',
        backgroundColor: theme.palette.common.white,
    },
}));

const StyledIcon = styled(NewReleases)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: '1.3em',
    position: 'relative',
}));

const NewInUnleashBody = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.inverse.main,
    color: theme.palette.inverse.contrastText,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusLarge,
    position: 'relative',
    width: '290px',

    '&:has(.read-more:focus-visible)': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
    },
}));

const TextContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    rowGap: theme.spacing(0.75),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
    color: theme.palette.text.secondary,
    zIndex: 1,
    ':hover': {
        backgroundColor: theme.palette.background.elevation2,
    },
}));

const NewInUnleash = styled(Typography)<TypographyProps>(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    columnGap: '.5ch',
    fontSize: theme.typography.caption.fontSize,
}));

const StyledButton = styled('button')(({ theme }) => ({
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'start',
    color: 'inherit',
    ':focus-visible': {
        outline: 'none',
    },
    '::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        cursor: 'pointer',
    },
}));

export const NewInUnleashToast = ({ item }: { item: NewInUnleashItem }) => {
    const navigate = useNavigate();
    const [seenItems, setSeenItems] = useLocalStorageState(
        `new-in-unleash-seen:v2`,
        new Set(),
    );
    const markAsSeen = ({ label }: NewInUnleashItem) => {
        // store a *new* Set reference, otherwise the state doesn't realize it's changed
        setSeenItems(new Set([...seenItems, label]));
    };
    const [startTransition, setStartTransition] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStartTransition(true);
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    const handleClick = () => {
        if (item.modal === false && item.appLink) {
            navigate(item.appLink);
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>
            <Snackbar
                sx={(theme) => ({ zIndex: theme.zIndex.modal })}
                open={!seenItems.has(item.label) && startTransition}
                message='New in Unleash'
                onClose={(_, reason) => {
                    if (reason === 'escapeKeyDown') {
                        markAsSeen(item);
                    }
                }}
                TransitionComponent={Slide}
            >
                <NewInUnleashBody>
                    <TextContainer>
                        <NewInUnleash component='p' variant='body2'>
                            <SvgWrapper>
                                <StyledIcon />
                            </SvgWrapper>
                            New in Unleash
                        </NewInUnleash>
                        <Typography
                            className='read-more'
                            component={StyledButton}
                            onClick={handleClick}
                            variant='body2'
                            fontWeight='bold'
                        >
                            {item.summary}
                        </Typography>
                        <CloseButton
                            aria-label='close'
                            onClick={() => {
                                markAsSeen(item);
                            }}
                            size='small'
                        >
                            <Close fontSize='inherit' />
                        </CloseButton>
                    </TextContainer>
                </NewInUnleashBody>
            </Snackbar>

            <NewInUnleashDialog
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                }}
                title={item.label}
                longDescription={item.longDescription}
                appLink={item.appLink}
                docsLink={item.docsLink}
                preview={item.preview}
                beta={item.beta}
            />
        </>
    );
};
