import type { FC } from 'react';
import { Typography, styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const NameWithChangeInfo: FC<{
    newName: string | undefined;
    previousName: string | undefined;
}> = ({ newName, previousName }) => {
    const titleHasChanged = Boolean(previousName && previousName !== newName);

    return (
        <>
            {titleHasChanged ? (
                <Truncated>
                    <Typography component='del' color='text.secondary'>
                        {previousName}
                    </Typography>
                </Truncated>
            ) : null}
            {newName ? (
                <Truncated>
                    <Typography>{newName}</Typography>
                </Truncated>
            ) : null}
        </>
    );
};
