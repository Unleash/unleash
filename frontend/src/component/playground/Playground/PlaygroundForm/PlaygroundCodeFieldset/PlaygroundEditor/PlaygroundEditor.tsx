import CodeMirror from '@uiw/react-codemirror';
import { useContext } from 'react';
import { json } from '@codemirror/lang-json';
import { Dispatch, SetStateAction, VFC, useCallback } from 'react';
import { styled, useTheme, Box } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { duotoneDark, duotoneLight } from '@uiw/codemirror-theme-duotone';
import Check from '@mui/icons-material/Check';
import { Error } from '@mui/icons-material';
import UIContext from 'contexts/UIContext';

interface IPlaygroundEditorProps {
    context: string | undefined;
    setContext: Dispatch<SetStateAction<string | undefined>>;
    error: string | undefined;
}

const StyledEditorHeader = styled('aside')(({ theme }) => ({
    height: '50px',
    backgroundColor: theme.palette.neutral.light,
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    borderTopLeftRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1, 2),
    color: theme.palette.text.primary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `1px solid ${theme.palette.lightBorder}`,
    borderBottom: 'none',
}));

const StyledEditorStatusContainer = styled('div')(({ theme, style }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color 0.5s ease-in-out`,
    borderRadius: '50%',
    opacity: 0.8,
    ...style,
}));

const StyledErrorSpan = styled('div')(({ theme }) => ({
    fontSize: '0.9rem',
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
}));

const EditorStatusOk = () => {
    const theme = useTheme();
    return (
        <StyledEditorStatusContainer
            style={{
                color: theme.palette.text.tertiaryContrast,
                backgroundColor: theme.palette.success.main,
            }}
        >
            <Check sx={{ width: '20px', height: '20px' }} />
        </StyledEditorStatusContainer>
    );
};

const EditorStatusError = () => {
    const theme = useTheme();

    return (
        <StyledEditorStatusContainer
            style={{
                color: theme.palette.text.tertiaryContrast,
                backgroundColor: theme.palette.error.main,
            }}
        >
            <Error />
        </StyledEditorStatusContainer>
    );
};

export const PlaygroundEditor: VFC<IPlaygroundEditorProps> = ({
    context,
    setContext,
    error,
}) => {
    const { themeMode } = useContext(UIContext);
    const theme = useTheme();
    const onCodeFieldChange = useCallback(
        context => {
            setContext(context);
        },
        [setContext]
    );

    return (
        <Box sx={{ width: '100%' }}>
            <StyledEditorHeader>
                JSON
                <ConditionallyRender
                    condition={Boolean(error)}
                    show={
                        <Box
                            sx={theme => ({
                                display: 'flex',
                                alignItems: 'center',
                            })}
                        >
                            <StyledErrorSpan>{error}</StyledErrorSpan>
                            <EditorStatusError />
                        </Box>
                    }
                    elseShow={<EditorStatusOk />}
                />
            </StyledEditorHeader>
            <CodeMirror
                value={context}
                height="200px"
                theme={themeMode === 'dark' ? duotoneDark : duotoneLight}
                extensions={[json()]}
                onChange={onCodeFieldChange}
                style={{
                    border: `1px solid ${theme.palette.lightBorder}`,
                    borderTop: 'none',
                    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
                    borderBottomRightRadius: theme.shape.borderRadiusMedium,
                }}
                placeholder={JSON.stringify(
                    {
                        currentTime: '2022-07-04T14:13:03.929Z',
                        appName: 'playground',
                        userId: 'test',
                        remoteAddress: '127.0.0.1',
                    },
                    null,
                    2
                )}
            />
        </Box>
    );
};
