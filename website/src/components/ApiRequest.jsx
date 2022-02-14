/**
   This component displays API requests in multiple different formats
   using the tabs component. It syncs across the page.

   Please note: it doees NOT cover all kinds of API requests just yet.
   If the type you're looking for isn't included, you may need to do
   some extra development before it can be used. In the future, it may
   be necessary to separate into multiple components based on request
   types, for instance.

**/

import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import { useUserData } from '@site/src/theme/Root';

const indentation = 2;

const Component = ({ verb, payload, url, title }) => {
    const userData = useUserData().userData;
    const verbUpper = verb?.toUpperCase() || '';
    const prettyPayload = JSON.stringify(payload, null, indentation);

    const fullUrl = `${userData.unleashUrl || '<unleash-url>'}/${url}`;

    const apiToken = userData.apiToken || '<api-token>';

    return (
        <Tabs groupId="api-request">
            <TabItem value="http" label="HTTP">
                <CodeBlock language="http" title={title}>
                    {`
${verbUpper} ${fullUrl}
Authorization: ${apiToken}
content-type: application/json

${prettyPayload}
`.trim()}
                </CodeBlock>
            </TabItem>
            <TabItem value="curl" label="cURL">
                <CodeBlock language="bash" title={title}>
                    {`
curl -H "Content-Type: application/json" \\
     -H "Authorization: ${apiToken}" \\
     -X ${verbUpper} \\
     -d '${prettyPayload}' \\
     ${fullUrl}
`.trim()}
                </CodeBlock>
            </TabItem>
            <TabItem value="httpie" label="HTTPie">
                <CodeBlock language="bash" title={title}>
                    {`echo '${prettyPayload}' \\
| http ${verbUpper} \\
  ${fullUrl} \\
  Authorization:${apiToken}`.trim()}
                </CodeBlock>
            </TabItem>
        </Tabs>
    );
};

export default Component;
