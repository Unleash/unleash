import { UserAvatar } from '../../../../common/UserAvatar/UserAvatar';
import { TextCell } from '../../../../common/Table/cells/TextCell/TextCell';

export const AvatarCell = ({ value }: any) => {
    return (
        <TextCell>
            <UserAvatar
                user={value}
                sx={{ maxWidth: '30px', maxHeight: '30px', alignSelf: 'left' }}
            />
        </TextCell>
    );
};
