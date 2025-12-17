import { Paper, styled, Typography  } from '@mui/material';
import { usePageTitle } from 'hooks/usePageTitle';
import type { ReactNode } from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';

const StyledMainHeader = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2.5, 4),
    boxShadow: 'none',
    marginBottom: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledTitleHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
}));

const StyledDescription = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(1),
}));

interface IMainHeaderProps {
    title?: string;
    description?: string;
    actions?: ReactNode;
}

export const MainHeader = ({
    title,
    description,
    actions,
}: IMainHeaderProps) => {
    usePageTitle(title);

    return (
        <StyledMainHeader>
            <StyledTitleHeader>
                <Typography variant='h1' component='h1'>
                    {title}
                </Typography>
                <StyledActions>{actions}</StyledActions>
            </StyledTitleHeader>
            <ConditionallyRender
                condition={Boolean(description?.length)}
                show={
                    <>
                        Description:
                        <StyledDescription>{description}</StyledDescription>
                    </>
                }
            />
        </StyledMainHeader>
    );
};
