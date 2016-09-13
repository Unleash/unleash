import React, { Component } from 'react';
import { Card, CardTitle, CardText } from 'react-toolbox';


export default class Features extends Component {
    render () {
        return (
                <Card>
                    <CardTitle>Feture toggles</CardTitle>
                    <CardText>
                        <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam pharetra finibus
                        ullamcorper. Proin laoreet faucibus venenatis. Aenean quis leo finibus, maximus
                         nisi finibus, fringilla ex. Nam mollis congue orci eu consectetur. Aliquam a
                         massa quis tortor vestibulum lacinia. Phasellus nisi velit, mattis vel nulla
                         a, rhoncus porta dui. Vestibulum viverra augue in pellentesque tincidunt.
                         Aliquam rhoncus nunc ipsum, sed vehicula leo dictum in. Phasellus accumsan
                         elis sem, in ullamcorper nisi accumsan vitae. Nullam vitae consectetur mi,
                         sed vulputate augue. In quis augue tellus. Duis convallis cursus elit, in
                         interdum nisl pulvinar viverra. Sed vel ornare sapien, eu consectetur metus.
                         Vivamus at porta nisl. Nullam in aliquam nisl.
                        </p>
                    </CardText>
                </Card>

        );
    }
};
