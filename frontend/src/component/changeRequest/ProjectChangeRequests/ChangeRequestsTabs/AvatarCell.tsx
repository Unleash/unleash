import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { styled, Typography } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
}));

export const AvatarCell = ({ value }: any) => {
    return (
        <TextCell>
            <StyledContainer>
                <Typography component={'span'} variant={'body2'}>
                    {' '}
                    {value?.username}
                </Typography>
            </StyledContainer>
        </TextCell>
    );
};
