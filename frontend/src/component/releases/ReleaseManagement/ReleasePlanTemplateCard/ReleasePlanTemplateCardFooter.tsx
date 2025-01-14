import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Box, styled } from '@mui/material';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';
import theme from 'themes/theme';
import { AvatarComponent } from 'component/common/AvatarGroup/AvatarGroup';

const StyledFooter = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
});

const StyledAvatar = styled(AvatarComponent)(({ theme }) => ({
    height: theme.spacing(3.5),
    width: theme.spacing(3.5),
    marginLeft: 0,
}));

const StyledContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledValue = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 1,
    lineClamp: `1`,
    WebkitLineClamp: 1,
    display: '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
    maxWidth: '100%',
    color: theme.palette.text.primary,
}));

interface IReleasePlanTemplateCardFooterProps {
    template: IReleasePlanTemplate;
}

export const ReleasePlanTemplateCardFooter = ({
    template,
}: IReleasePlanTemplateCardFooterProps) => {
    const { user: createdBy } = useUserInfo(`${template.createdByUserId}`);

    return (
        <StyledFooter>
            <StyledAvatar user={createdBy} />
            <StyledContainer>
                <span>Created by</span>
                <StyledValue>
                    {createdBy.name || createdBy.username || createdBy.email}
                </StyledValue>
            </StyledContainer>
        </StyledFooter>
    );
};
