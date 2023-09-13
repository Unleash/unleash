import { Box } from '@mui/material';
import { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

export const FeatureFlagNamingTooltip: FC = () => {
    const X = 'X';
    const nx = 'n{X,}';
    const nxy = 'n{X,Y}';
    return (
        <HelpIcon
            htmlTooltip
            tooltip={
                <Box>
                    <h3>Enforce a naming convention for feature flags</h3>
                    <hr />
                    <p>{`eg. [A-Za-z0-9]{2}[.][a-z]{4,12} matches 'a1.project'`}</p>
                    <div className="scrollable">
                        <h3>Brackets:</h3>
                        <table>
                            <tbody>
                                <tr>
                                    <td>[abc]</td>
                                    <td>Match a single character a, b, or c</td>
                                </tr>
                                <tr>
                                    <td>[^abc]</td>
                                    <td>
                                        Match any character except a, b, or c
                                    </td>
                                </tr>
                                <tr>
                                    <td>[A-Za-z]</td>
                                    <td>
                                        Match any character from uppercase A to
                                        lowercase z
                                    </td>
                                </tr>
                                <tr>
                                    <td>(ab|cd|ef)</td>
                                    <td>Match either ab, cd, or ef</td>
                                </tr>
                                <tr>
                                    <td>(...)</td>
                                    <td>Capture anything enclosed</td>
                                </tr>
                            </tbody>
                        </table>
                        <h3>Metacharacters</h3>
                        <table>
                            <tbody>
                                <tr>
                                    <td>^</td>
                                    <td>Start of line</td>
                                </tr>
                                <tr>
                                    <td>$</td>
                                    <td>End of line</td>
                                </tr>
                                <tr>
                                    <td>.</td>
                                    <td>Match any character</td>
                                </tr>
                                <tr>
                                    <td>\w</td>
                                    <td>Match a word chracter</td>
                                </tr>
                                <tr>
                                    <td>\W</td>
                                    <td>Match a non-word character</td>
                                </tr>
                                <tr>
                                    <td>\d</td>
                                    <td>Match a digit</td>
                                </tr>
                                <tr>
                                    <td>\D</td>
                                    <td>Match any non-digit character</td>
                                </tr>
                                <tr>
                                    <td>\s</td>
                                    <td>Match a whitespace character</td>
                                </tr>
                                <tr>
                                    <td>\S</td>
                                    <td>Match a non-whitespace character</td>
                                </tr>
                                <tr>
                                    <td>\b</td>
                                    <td>
                                        Match character at the beginning or end
                                        of a word
                                    </td>
                                </tr>
                                <tr>
                                    <td>\B</td>
                                    <td>
                                        Match a character not at beginning or
                                        end of a word
                                    </td>
                                </tr>
                                <tr>
                                    <td>\0</td>
                                    <td>Match a NUL character</td>
                                </tr>
                                <tr>
                                    <td>\t</td>
                                    <td>Match a tab character</td>
                                </tr>
                                <tr>
                                    <td>\xxx</td>
                                    <td>
                                        Match a character specified by octal
                                        number xxx
                                    </td>
                                </tr>
                                <tr>
                                    <td>\xdd</td>
                                    <td>
                                        Match a character specified by
                                        hexadecimal number dd
                                    </td>
                                </tr>
                                <tr>
                                    <td>\uxxxx</td>
                                    <td>
                                        Match a Unicode character specified by
                                        hexadecimal number xxxx
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <h3>Quantifiers</h3>
                        <table>
                            <tbody>
                                <tr>
                                    <td>n+</td>
                                    <td>Match at least one n</td>
                                </tr>
                                <tr>
                                    <td>n*</td>
                                    <td>Match zero or more n's</td>
                                </tr>
                                <tr>
                                    <td>n?</td>
                                    <td>Match zero or one n</td>
                                </tr>
                                <tr>
                                    <td>n{X}</td>
                                    <td>Match sequence of X n's</td>
                                </tr>
                                <tr>
                                    <td>{nxy}</td>
                                    <td>Match sequence of X to Y n's</td>
                                </tr>
                                <tr>
                                    <td>{nx}</td>
                                    <td>Match sequence of X or more n's</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Box>
            }
        />
    );
};
