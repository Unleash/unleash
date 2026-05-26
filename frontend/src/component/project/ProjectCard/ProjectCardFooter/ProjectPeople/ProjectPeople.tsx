import type { ProjectSchema } from 'openapi';
import { AvatarGroupFromOwners } from 'component/common/AvatarGroupFromOwners/AvatarGroupFromOwners';
import {
    StyledAvatarComponent,
    StyledContainer,
    StyledWrapper,
} from '../ProjectCardFooter.styles.ts';

type ProjectPeopleProps = {
    owners?: ProjectSchema['owners'];
    total?: number;
};

export const ProjectPeople = ({ owners = [], total }: ProjectPeopleProps) => {
    return (
        <StyledWrapper>
            <StyledContainer data-loading>
                <AvatarGroupFromOwners
                    users={owners}
                    avatarLimit={4}
                    total={total}
                    AvatarComponent={StyledAvatarComponent}
                />
            </StyledContainer>
        </StyledWrapper>
    );
};
