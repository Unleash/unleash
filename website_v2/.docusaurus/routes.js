
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';
export default [
{
  path: '/',
  component: ComponentCreator('/','deb'),
  exact: true,
},
{
  path: '/__docusaurus/debug',
  component: ComponentCreator('/__docusaurus/debug','3d6'),
  exact: true,
},
{
  path: '/__docusaurus/debug/config',
  component: ComponentCreator('/__docusaurus/debug/config','914'),
  exact: true,
},
{
  path: '/__docusaurus/debug/content',
  component: ComponentCreator('/__docusaurus/debug/content','c28'),
  exact: true,
},
{
  path: '/__docusaurus/debug/globalData',
  component: ComponentCreator('/__docusaurus/debug/globalData','3cf'),
  exact: true,
},
{
  path: '/__docusaurus/debug/metadata',
  component: ComponentCreator('/__docusaurus/debug/metadata','31b'),
  exact: true,
},
{
  path: '/__docusaurus/debug/registry',
  component: ComponentCreator('/__docusaurus/debug/registry','0da'),
  exact: true,
},
{
  path: '/__docusaurus/debug/routes',
  component: ComponentCreator('/__docusaurus/debug/routes','244'),
  exact: true,
},
{
  path: '/docs',
  component: ComponentCreator('/docs','9bf'),
  
  routes: [
{
  path: '/docs/',
  component: ComponentCreator('/docs/','2c4'),
  exact: true,
},
{
  path: '/docs/activation_strategy',
  component: ComponentCreator('/docs/activation_strategy','d3b'),
  exact: true,
},
{
  path: '/docs/addons/index',
  component: ComponentCreator('/docs/addons/index','aa1'),
  exact: true,
},
{
  path: '/docs/addons/jira-commenter',
  component: ComponentCreator('/docs/addons/jira-commenter','ccc'),
  exact: true,
},
{
  path: '/docs/addons/slack',
  component: ComponentCreator('/docs/addons/slack','842'),
  exact: true,
},
{
  path: '/docs/addons/webhook',
  component: ComponentCreator('/docs/addons/webhook','2ef'),
  exact: true,
},
{
  path: '/docs/advanced/api_access',
  component: ComponentCreator('/docs/advanced/api_access','6d3'),
  exact: true,
},
{
  path: '/docs/advanced/archived_toggles',
  component: ComponentCreator('/docs/advanced/archived_toggles','794'),
  exact: true,
},
{
  path: '/docs/advanced/audit_log',
  component: ComponentCreator('/docs/advanced/audit_log','355'),
  exact: true,
},
{
  path: '/docs/advanced/custom_activation_strategy',
  component: ComponentCreator('/docs/advanced/custom_activation_strategy','03c'),
  exact: true,
},
{
  path: '/docs/advanced/feature_toggle_types',
  component: ComponentCreator('/docs/advanced/feature_toggle_types','2fe'),
  exact: true,
},
{
  path: '/docs/advanced/strategy_constraints',
  component: ComponentCreator('/docs/advanced/strategy_constraints','3ce'),
  exact: true,
},
{
  path: '/docs/advanced/tags',
  component: ComponentCreator('/docs/advanced/tags','293'),
  exact: true,
},
{
  path: '/docs/advanced/toggle_variants',
  component: ComponentCreator('/docs/advanced/toggle_variants','35d'),
  exact: true,
},
{
  path: '/docs/api/admin/addons',
  component: ComponentCreator('/docs/api/admin/addons','faf'),
  exact: true,
},
{
  path: '/docs/api/admin/context',
  component: ComponentCreator('/docs/api/admin/context','f9e'),
  exact: true,
},
{
  path: '/docs/api/admin/events',
  component: ComponentCreator('/docs/api/admin/events','0b6'),
  exact: true,
},
{
  path: '/docs/api/admin/feature-types',
  component: ComponentCreator('/docs/api/admin/feature-types','8c5'),
  exact: true,
},
{
  path: '/docs/api/admin/features',
  component: ComponentCreator('/docs/api/admin/features','669'),
  exact: true,
},
{
  path: '/docs/api/admin/metrics',
  component: ComponentCreator('/docs/api/admin/metrics','1fc'),
  exact: true,
},
{
  path: '/docs/api/admin/projects',
  component: ComponentCreator('/docs/api/admin/projects','d1d'),
  exact: true,
},
{
  path: '/docs/api/admin/state',
  component: ComponentCreator('/docs/api/admin/state','750'),
  exact: true,
},
{
  path: '/docs/api/admin/strategies',
  component: ComponentCreator('/docs/api/admin/strategies','9b0'),
  exact: true,
},
{
  path: '/docs/api/admin/tags',
  component: ComponentCreator('/docs/api/admin/tags','42a'),
  exact: true,
},
{
  path: '/docs/api/client/features',
  component: ComponentCreator('/docs/api/client/features','f13'),
  exact: true,
},
{
  path: '/docs/api/client/metrics',
  component: ComponentCreator('/docs/api/client/metrics','6d2'),
  exact: true,
},
{
  path: '/docs/api/client/register',
  component: ComponentCreator('/docs/api/client/register','22e'),
  exact: true,
},
{
  path: '/docs/api/index',
  component: ComponentCreator('/docs/api/index','a79'),
  exact: true,
},
{
  path: '/docs/api/internal/health',
  component: ComponentCreator('/docs/api/internal/health','4ec'),
  exact: true,
},
{
  path: '/docs/api/internal/internal',
  component: ComponentCreator('/docs/api/internal/internal','423'),
  exact: true,
},
{
  path: '/docs/api/open_api',
  component: ComponentCreator('/docs/api/open_api','56d'),
  exact: true,
},
{
  path: '/docs/client_sdk',
  component: ComponentCreator('/docs/client_sdk','b36'),
  exact: true,
},
{
  path: '/docs/client_specification',
  component: ComponentCreator('/docs/client_specification','009'),
  exact: true,
},
{
  path: '/docs/database_schema',
  component: ComponentCreator('/docs/database_schema','487'),
  exact: true,
},
{
  path: '/docs/deploy/configuring_unleash',
  component: ComponentCreator('/docs/deploy/configuring_unleash','29c'),
  exact: true,
},
{
  path: '/docs/deploy/database_backup',
  component: ComponentCreator('/docs/deploy/database_backup','d96'),
  exact: true,
},
{
  path: '/docs/deploy/getting_started',
  component: ComponentCreator('/docs/deploy/getting_started','1d3'),
  exact: true,
},
{
  path: '/docs/deploy/google_auth',
  component: ComponentCreator('/docs/deploy/google_auth','21e'),
  exact: true,
},
{
  path: '/docs/deploy/import_export',
  component: ComponentCreator('/docs/deploy/import_export','111'),
  exact: true,
},
{
  path: '/docs/deploy/migration_guide',
  component: ComponentCreator('/docs/deploy/migration_guide','7e8'),
  exact: true,
},
{
  path: '/docs/deploy/securing_unleash',
  component: ComponentCreator('/docs/deploy/securing_unleash','a39'),
  exact: true,
},
{
  path: '/docs/deploy/technical_debt',
  component: ComponentCreator('/docs/deploy/technical_debt','1a7'),
  exact: true,
},
{
  path: '/docs/developer_guide',
  component: ComponentCreator('/docs/developer_guide','dac'),
  exact: true,
},
{
  path: '/docs/getting_started',
  component: ComponentCreator('/docs/getting_started','a91'),
  exact: true,
},
{
  path: '/docs/guides/feature_updates_to_slack',
  component: ComponentCreator('/docs/guides/feature_updates_to_slack','132'),
  exact: true,
},
{
  path: '/docs/index',
  component: ComponentCreator('/docs/index','085'),
  exact: true,
},
{
  path: '/docs/integrations/integrations',
  component: ComponentCreator('/docs/integrations/integrations','5f9'),
  exact: true,
},
{
  path: '/docs/sdks/dot_net_sdk',
  component: ComponentCreator('/docs/sdks/dot_net_sdk','667'),
  exact: true,
},
{
  path: '/docs/sdks/go_sdk',
  component: ComponentCreator('/docs/sdks/go_sdk','4cd'),
  exact: true,
},
{
  path: '/docs/sdks/java_sdk',
  component: ComponentCreator('/docs/sdks/java_sdk','ef5'),
  exact: true,
},
{
  path: '/docs/sdks/node_sdk',
  component: ComponentCreator('/docs/sdks/node_sdk','971'),
  exact: true,
},
{
  path: '/docs/sdks/python_sdk',
  component: ComponentCreator('/docs/sdks/python_sdk','cdb'),
  exact: true,
},
{
  path: '/docs/sdks/ruby_sdk',
  component: ComponentCreator('/docs/sdks/ruby_sdk','9c0'),
  exact: true,
},
{
  path: '/docs/toggle_variants',
  component: ComponentCreator('/docs/toggle_variants','e7d'),
  exact: true,
},
{
  path: '/docs/unleash_context',
  component: ComponentCreator('/docs/unleash_context','e60'),
  exact: true,
},
{
  path: '/docs/user_guide/activation_strategy',
  component: ComponentCreator('/docs/user_guide/activation_strategy','ed6'),
  exact: true,
},
{
  path: '/docs/user_guide/client_sdk',
  component: ComponentCreator('/docs/user_guide/client_sdk','5fd'),
  exact: true,
},
{
  path: '/docs/user_guide/connect_sdk',
  component: ComponentCreator('/docs/user_guide/connect_sdk','ffc'),
  exact: true,
},
{
  path: '/docs/user_guide/control_rollout',
  component: ComponentCreator('/docs/user_guide/control_rollout','7a9'),
  exact: true,
},
{
  path: '/docs/user_guide/create_feature_toggle',
  component: ComponentCreator('/docs/user_guide/create_feature_toggle','1b2'),
  exact: true,
},
{
  path: '/docs/user_guide/discover_unknown_toggles',
  component: ComponentCreator('/docs/user_guide/discover_unknown_toggles','552'),
  exact: true,
},
{
  path: '/docs/user_guide/native_apps',
  component: ComponentCreator('/docs/user_guide/native_apps','281'),
  exact: true,
},
{
  path: '/docs/user_guide/projects',
  component: ComponentCreator('/docs/user_guide/projects','4c9'),
  exact: true,
},
{
  path: '/docs/user_guide/single_page_apps',
  component: ComponentCreator('/docs/user_guide/single_page_apps','ef9'),
  exact: true,
},
{
  path: '/docs/user_guide/unleash_context',
  component: ComponentCreator('/docs/user_guide/unleash_context','b5a'),
  exact: true,
},
]
},
{
  path: '*',
  component: ComponentCreator('*')
}
];
