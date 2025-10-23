import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { styled, Typography } from '@mui/material';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { ComponentProps } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
    columnGap: theme.spacing(0.5),
}));

type AvatarCellProps = {
    value: ComponentProps<typeof UserAvatar>['user'];
};

export const AvatarCell = ({ value }: AvatarCellProps) => {
    const { searchQuery } = useSearchHighlightContext();
    return (
        <TextCell>
            <StyledContainer>
                <UserAvatar disableTooltip={true} user={value} />
                <Typography component={'span'} variant={'body2'}>
                    <Truncator title={value?.username}>
                        <Highlighter search={searchQuery}>
                            {value?.username}
                        </Highlighter>
                    </Truncator>
                </Typography>
            </StyledContainer>
        </TextCell>
    );
};
