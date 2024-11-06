import { styled } from '@mui/material';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';

const NoReleaseTemplatesMessage = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(1, 0, 0, 0),
}));

const TemplatesEasierMessage = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(1, 0, 9, 0),
    color: theme.palette.text.secondary,
}));

const StyledCenter = styled('div')(({ theme }) => ({
    textAlign: 'center',
}));

const StyledDiv = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(5),
}));
export const EmptyTemplatesListMessage = () => {
    return (
        <StyledDiv>
            <StyledCenter>
                <ReleaseTemplateIcon />
            </StyledCenter>
            <NoReleaseTemplatesMessage>
                You have no release templates set up
            </NoReleaseTemplatesMessage>
            <TemplatesEasierMessage>
                Make the set up of strategies easier for your
                <br />
                teams by creating templates
            </TemplatesEasierMessage>
        </StyledDiv>
    );
};
