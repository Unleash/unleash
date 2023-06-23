import { Box, styled, useTheme } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledCardTitleRow = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledCardDescription = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const StyledPropertyName = styled('p')(({ theme }) => ({
    display: 'table-cell',
    fontWeight: theme.fontWeight.bold,
    paddingTop: theme.spacing(2),
}));

const StyledPropertyDetails = styled('p')(({ theme }) => ({
    display: 'table-cell',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
}));

const StyledDataCollectionExplanation = styled('div')(({ theme }) => ({
    display: 'table-cell',
    width: '75%',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const StyledDataCollectionBadge = styled('div')(({ theme }) => ({
    display: 'table-cell',
}));

const StyledTag = styled('span')(({ theme }) => ({
    display: 'block',
    textAlign: 'right',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    color: theme.palette.neutral.dark,
}));

const StyledDescription = styled('div')(({ theme }) => ({
    maxWidth: theme.spacing(50),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDataCollectionPropertyRow = styled('div')(() => ({
    display: 'table-row',
}));

const StyledDataCollectionPropertyTable = styled('div')(() => ({
    display: 'table',
}));

const StyledDataCollectionPropertyCell = styled('div')(() => ({
    display: 'table-cell',
}));

interface IPrivacyProps {
    title: string;
    infoText: string;
    concreteDetails: Record<string, string>;
    enabled: boolean;
    changeInfoText: string;
    variablesTexts: string[];
    dependsOnText?: string;
}

interface IToolTipInstructionContentProps {
    changeInfoText: string;
    variablesTexts: string[];
    dependsOnText?: string;
}

const ToolTipInstructionContent = ({
    changeInfoText,
    variablesTexts,
    dependsOnText,
}: IToolTipInstructionContentProps) => {
    return (
        <StyledDescription>
            <ToolTipDescriptionText>{changeInfoText}</ToolTipDescriptionText>

            <ToolTipDescriptionCode>
                {variablesTexts.map(text => (
                    <div>{text}</div>
                ))}
            </ToolTipDescriptionCode>

            {dependsOnText && (
                <ToolTipDescriptionText>{dependsOnText}</ToolTipDescriptionText>
            )}
        </StyledDescription>
    );
};

const ToolTipDescriptionCode = styled('code')(({ theme }) => ({
    display: 'block',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.application,
    fontSize: theme.fontSizes.smallerBody,
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    lineHeight: 1.5,
}));

const ToolTipDescriptionText = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(1),
}));

export const InstancePrivacy = ({
    title,
    infoText,
    concreteDetails,
    enabled,
    changeInfoText,
    variablesTexts,
    dependsOnText,
}: IPrivacyProps) => {
    return (
        <StyledContainer>
            <StyledCardTitleRow>
                <b>{title}</b>
                <StyledDataCollectionBadge>
                    {enabled && (
                        <Badge color="success" icon={<CheckIcon />}>
                            Data is collected
                        </Badge>
                    )}
                    {!enabled && (
                        <Badge color="neutral" icon={<ClearIcon />}>
                            No data is collected
                        </Badge>
                    )}
                </StyledDataCollectionBadge>
            </StyledCardTitleRow>

            <StyledCardDescription>
                <StyledDataCollectionPropertyTable>
                    <StyledDataCollectionExplanation>
                        {infoText}
                    </StyledDataCollectionExplanation>
                    <StyledDataCollectionPropertyCell>
                        <StyledTag>
                            <HtmlTooltip
                                title={
                                    <ToolTipInstructionContent
                                        changeInfoText={changeInfoText}
                                        variablesTexts={variablesTexts}
                                        dependsOnText={dependsOnText}
                                    />
                                }
                                arrow
                            >
                                <div>
                                    {enabled
                                        ? 'How to disable collecting data?'
                                        : 'How to enable collecting data?'}
                                </div>
                            </HtmlTooltip>
                        </StyledTag>
                    </StyledDataCollectionPropertyCell>
                </StyledDataCollectionPropertyTable>

                <StyledDataCollectionPropertyTable>
                    {Object.entries(concreteDetails).map(([key, value]) => {
                        return (
                            <StyledDataCollectionPropertyRow>
                                <StyledPropertyName>{key}</StyledPropertyName>
                                <StyledPropertyDetails>
                                    {value}
                                </StyledPropertyDetails>
                            </StyledDataCollectionPropertyRow>
                        );
                    })}
                </StyledDataCollectionPropertyTable>
            </StyledCardDescription>
        </StyledContainer>
    );
};
