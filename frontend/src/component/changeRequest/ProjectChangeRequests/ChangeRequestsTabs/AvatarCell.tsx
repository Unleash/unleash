import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { styled, Typography } from '@mui/material';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
}));

export const AvatarCell = ({ value }: any) => {
    const { searchQuery } = useSearchHighlightContext();
    return (
        <TextCell>
            <StyledContainer>
                <Typography component={'span'} variant={'body2'}>
                    {' '}
                    <Highlighter search={searchQuery}>
                        {value?.username}
                    </Highlighter>
                </Typography>
            </StyledContainer>
        </TextCell>
    );
};
