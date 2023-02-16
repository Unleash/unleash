import { FC, useState } from 'react';
import { Close, HelpOutline } from '@mui/icons-material';
import {
    Box,
    IconButton,
    Popper,
    Paper,
    ClickAwayListener,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Feedback } from './Feedback';

interface IHelpPopperProps {
    id: string;
}

export const HelpPopper: FC<IHelpPopperProps> = ({ children, id }) => {
    const [anchor, setAnchorEl] = useState<null | Element>(null);
    const { isPro } = useUiConfig();

    const onOpen = (event: React.FormEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const onClose = () => setAnchorEl(null);

    const open = Boolean(anchor);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: theme => theme.spacing(0.5),
                right: theme => theme.spacing(0.5),
            }}
        >
            <IconButton onClick={onOpen} aria-describedby={id} size="small">
                <HelpOutline
                    sx={{ fontSize: theme => theme.typography.body1.fontSize }}
                />
            </IconButton>

            <Popper
                id={id}
                open={open}
                anchorEl={anchor}
                sx={theme => ({ zIndex: theme.zIndex.tooltip })}
            >
                <ClickAwayListener onClickAway={onClose}>
                    <Paper
                        sx={theme => ({
                            padding: theme.spacing(3, 3),
                            maxWidth: '350px',
                            borderRadius: `${theme.shape.borderRadiusMedium}px`,
                            border: `1px solid ${theme.palette.neutral.border}`,
                            fontSize: theme.typography.body2.fontSize,
                        })}
                        elevation={3}
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{ position: 'absolute', right: 4, top: 4 }}
                        >
                            <Close
                                sx={{
                                    fontSize: theme =>
                                        theme.typography.body1.fontSize,
                                }}
                            />
                        </IconButton>
                        {children}
                        <ConditionallyRender
                            condition={isPro()}
                            show={() => <Feedback id={id} />}
                        />
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
};
