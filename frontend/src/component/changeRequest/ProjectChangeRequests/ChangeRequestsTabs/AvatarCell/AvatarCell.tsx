import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
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
                <UserAvatar
                    user={value}
                    sx={theme => ({ marginRight: theme.spacing(0.5) })}
                />
                <Typography component={'span'} variant={'body2'}>
                    {' '}
                    {value?.username}
                </Typography>
            </StyledContainer>
        </TextCell>
    );
};
