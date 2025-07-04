import type { FC } from 'react';
import { Typography, type TypographyProps, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { textTruncated } from 'themes/themeStyles';

const Truncated = styled('span')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

const NewName = styled(Typography)<TypographyProps>({
    textDecoration: 'none',
});

export const NameWithChangeInfo: FC<{
    newName?: string;
    previousName?: string;
}> = ({ newName, previousName }) => {
    const titleHasChanged = Boolean(previousName && previousName !== newName);
    const titleHasChangedOrBeenAdded = Boolean(
        titleHasChanged || (!previousName && newName),
    );

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
                        <NewName
                            component={
                                titleHasChangedOrBeenAdded ? 'ins' : 'span'
                            }
                        >
                            {newName}
                        </NewName>
                    </Truncated>
                }
            />
        </>
    );
};
