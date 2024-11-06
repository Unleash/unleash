import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import { styled, Typography } from '@mui/material';
import { ReleasePlanTemplateCardMenu } from './ReleasePlanTemplateCardMenu';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';

const StyledTemplateCard = styled('aside')(({ theme }) => ({
    height: '100%',
    '&:hover': {
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.neutral.light,
    },
    overflow: 'hidden',
}));

const TemplateCardHeader = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2.5),
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
}));

const TemplateCardBody = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.25),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    borderTop: 'none',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledCenter = styled('div')(({ theme }) => ({
    textAlign: 'center',
}));

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
}));

const StyledCreatedBy = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    display: 'flex',
    alignItems: 'center',
    marginRight: 'auto',
}));

const StyledMenu = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    display: 'flex',
    alignItems: 'center',
}));

export const ReleasePlanTemplateCard = ({
    template,
}: { template: IReleasePlanTemplate }) => {
    const { user } = useUserInfo(template.createdByUserId.toString());

    return (
        <StyledTemplateCard>
            <TemplateCardHeader>
                <StyledCenter>
                    <ReleaseTemplateIcon />
                </StyledCenter>
            </TemplateCardHeader>
            <TemplateCardBody>
                <div>{template.name}</div>
                <StyledDiv>
                    <StyledCreatedBy>Created by {user.name}</StyledCreatedBy>
                    <StyledMenu onClick={(e) => e.preventDefault()}>
                        <ReleasePlanTemplateCardMenu template={template} />
                    </StyledMenu>
                </StyledDiv>
            </TemplateCardBody>
        </StyledTemplateCard>
    );
};
