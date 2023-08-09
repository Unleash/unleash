import { FC } from 'react';
import { Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { textTruncated } from 'themes/themeStyles';

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const NameWithChangeInfo: FC<{
    newTitle: string | undefined;
    previousTitle: string | undefined;
}> = ({ newTitle, previousTitle }) => {
    const titleHasChanged = Boolean(
        previousTitle && previousTitle !== newTitle
    );

    const titleHasChangedOrBeenAdded = Boolean(
        titleHasChanged || (!previousTitle && newTitle)
    );

    return (
        <>
            <ConditionallyRender
                condition={titleHasChanged}
                show={
                    <Truncated>
                        <Typography component="del" color="text.secondary">
                            {previousTitle}
                        </Typography>
                    </Truncated>
                }
            />
            <ConditionallyRender
                condition={Boolean(newTitle)}
                show={
                    <Truncated>
                        <Typography
                            component={
                                titleHasChangedOrBeenAdded ? 'ins' : 'span'
                            }
                        >
                            {newTitle}
                        </Typography>
                    </Truncated>
                }
            />
        </>
    );
};
