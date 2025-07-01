import type { FC } from 'react';
import { Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
            <ConditionallyRender
                condition={titleHasChanged}
                show={
                    <Truncated>
                        <Typography component='del' color='text.secondary'>
                            {previousName}
                        </Typography>
                    </Truncated>
                }
            />
            <ConditionallyRender
                condition={Boolean(newName)}
                show={
                    <Truncated>
                        <Typography>{newName}</Typography>
                    </Truncated>
                }
            />
        </>
    );
};
