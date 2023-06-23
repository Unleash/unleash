import { Box, styled, useTheme } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import CodeMirror from '@uiw/react-codemirror';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { duotoneDark, duotoneLight } from '@uiw/codemirror-theme-duotone';
import UIContext from 'contexts/UIContext';
import { useContext } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const CardTitleRow = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const CardDescription = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const PropertyName = styled('p')(({ theme }) => ({
    display: 'table-cell',
    fontWeight: theme.fontWeight.bold,
    paddingTop: theme.spacing(2),
}));

const PropertyDetails = styled('p')(({ theme }) => ({
    display: 'table-cell',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
}));

const DataCollectionExplanation = styled('div')(({ theme }) => ({
    display: 'table-cell',
    width: '75%',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const DataCollectionBadge = styled('div')(({ theme }) => ({
    display: 'table-cell',
}));

interface IPrivacyProps {
    title: String;
    infoText: String;
    concreteDetails: Record<string, string>;
    enabled: boolean;
    changeInfoText: String;
    variablesTexts: String[];
    dependsOnText?: String;
}

interface ICodeTooltip {
    changeInfoText: String;
    variablesTexts: String[];
    dependsOnText?: String;
}

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

const ToolTipInstructionContent = ({
    changeInfoText,
    variablesTexts,
    dependsOnText,
}: ICodeTooltip) => {
    const { themeMode } = useContext(UIContext);
    const theme = useTheme();
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

const TooltipDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
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
            <CardTitleRow>
                <b>{title}</b>
                <DataCollectionBadge>
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
                </DataCollectionBadge>
            </CardTitleRow>

            <CardDescription>
                <div style={{ display: 'table' }}>
                    <DataCollectionExplanation>
                        {infoText}
                    </DataCollectionExplanation>
                    <div style={{ display: 'table-cell' }}>
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
                    </div>
                </div>

                <div style={{ display: 'table' }}>
                    {Object.entries(concreteDetails).map(([key, value]) => {
                        return (
                            <div key={key} style={{ display: 'table-row' }}>
                                <PropertyName>{key}</PropertyName>
                                <PropertyDetails>{value}</PropertyDetails>
                            </div>
                        );
                    })}
                </div>
            </CardDescription>
        </StyledContainer>
    );
};
