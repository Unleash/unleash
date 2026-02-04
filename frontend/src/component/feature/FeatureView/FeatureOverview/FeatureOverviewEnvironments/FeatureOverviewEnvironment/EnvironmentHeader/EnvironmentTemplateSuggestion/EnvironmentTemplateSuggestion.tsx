import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    StyledBold,
    StyledBox,
    StyledSpan,
    StyledSuggestion,
    TooltipDescription,
} from '../EnvironmentHeader.styles';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

type EnvironmentTemplateSuggestionProps = {
    onClick: () => void;
};

export const EnvironmentTemplateSuggestion = ({
    onClick,
}: EnvironmentTemplateSuggestionProps) => {
    return (
        <StyledSuggestion>
            <StyledBold>Suggestion:</StyledBold>
            &nbsp;Add a&nbsp;
            <HtmlTooltip
                title={
                    <StyledBox>
                        <TooltipDescription>
                            Release templates are defined globally&nbsp;
                            <Link
                                to='/release-templates'
                                title='Release templates'
                            >
                                here
                            </Link>
                        </TooltipDescription>
                    </StyledBox>
                }
                maxWidth='200'
                arrow
            >
                <StyledSpan>release template</StyledSpan>
            </HtmlTooltip>
            &nbsp;to this environment&nbsp;
            <Button size='small' variant='text' onClick={onClick}>
                Choose a release template
            </Button>
        </StyledSuggestion>
    );
};
