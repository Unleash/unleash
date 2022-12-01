import { useRef, useState, VFC } from 'react';
import {
    useTheme,
    IconButton,
    Typography,
    useMediaQuery,
    Popover,
    Box,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HelpOutline } from '@mui/icons-material';
import { ReactComponent as ChangeRequestProcessImage } from 'assets/img/changeRequestProcess.svg';

interface IChangeRequestProcessHelpProps {}

export const ChangeRequestProcessHelp: VFC<
    IChangeRequestProcessHelpProps
> = () => {
    const ref = useRef<HTMLButtonElement>(null);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <ConditionallyRender
                condition={!isSmallScreen}
                show={
                    <Typography variant="body2">
                        Show change request process{' '}
                    </Typography>
                }
            />
            <IconButton
                title="Change request process"
                ref={ref}
                onClick={() => setIsOpen(true)}
            >
                <HelpOutline />
            </IconButton>
            <Popover
                open={isOpen}
                anchorEl={ref.current}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={() => setIsOpen(false)}
            >
                <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 920 }}>
                    <Typography variant="h3">
                        Change request process:
                    </Typography>
                    <Typography variant="body2">
                        <ol>
                            <li>
                                When changes are detected they are added into a
                                draft mode
                            </li>
                            <li>
                                The next step is for those changes to be sent
                                for review
                            </li>
                            <li>
                                These changes can be seen by everyone but only
                                who has <strong>“Review change request”</strong>{' '}
                                permission can Approve them
                            </li>
                            <ul>
                                <li>
                                    If changes are Approved then someone who has{' '}
                                    <strong>“Apply change request”</strong>{' '}
                                    permission needs to apply these changes to
                                    be live on the feature toggles and request
                                    is Closed
                                </li>
                                <li>
                                    If changes are Cancelled by the author or
                                    admin then change request goes automatically
                                    to Cancelled and request is Closed.
                                </li>
                            </ul>
                        </ol>
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <ChangeRequestProcessImage
                            style={{ maxWidth: 'calc(100vw - 4rem)' }}
                        />
                    </Box>
                </Box>
            </Popover>
        </>
    );
};
