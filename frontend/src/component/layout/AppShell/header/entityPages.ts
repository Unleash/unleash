import { matchPath } from 'react-router';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import useUserInfo from 'hooks/api/getters/useUserInfo/useUserInfo';

type EntityParams = Record<string, string>;

type UseEntityName = (params: EntityParams) => string | undefined;

// A page of one named entity that a sidebar item lists, e.g. a flag or a
// segment. `pattern` without its trailing wildcard is the entity's own page.
type EntityPageDefinition = {
    pattern: string;
    except?: string[];
    useName: UseEntityName;
};

export type EntityPage = {
    pattern: string;
    to: string;
    params: EntityParams;
    useName: UseEntityName;
};

const namedInUrl =
    (paramName: string): UseEntityName =>
    (urlParams) =>
        urlParams[paramName];

const useChangeRequestTitle: UseEntityName = ({ projectId, id }) =>
    useChangeRequest(projectId, id).data?.title;

const useSegmentName: UseEntityName = ({ segmentId }) =>
    useSegment(Number(segmentId)).segment?.name;

const useReleaseTemplateName: UseEntityName = ({ templateId }) =>
    useReleasePlanTemplate(templateId).template.name;

const useFeatureTypeName: UseEntityName = ({ featureTypeId }) =>
    useFeatureTypes().featureTypes.find(({ id }) => id === featureTypeId)?.name;

const useGroupName: UseEntityName = ({ groupId }) =>
    useGroup(Number(groupId)).group?.name;

const useUserName: UseEntityName = ({ id }) => {
    const { user } = useUserInfo(id);
    return user.name || user.username || user.email;
};

const entityPages: EntityPageDefinition[] = [
    {
        pattern: '/projects/:projectId/features/:featureId/*',
        useName: namedInUrl('featureId'),
    },
    {
        pattern: '/projects/:projectId/change-requests/:id',
        useName: useChangeRequestTitle,
    },
    { pattern: '/applications/:name/*', useName: namedInUrl('name') },
    { pattern: '/context/edit/:name', useName: namedInUrl('name') },
    {
        pattern: '/feature-toggle-type/edit/:featureTypeId',
        useName: useFeatureTypeName,
    },
    {
        pattern: '/strategies/:name/*',
        except: ['/strategies/create'],
        useName: namedInUrl('name'),
    },
    {
        pattern: '/environments/:id',
        except: ['/environments/create'],
        useName: namedInUrl('id'),
    },
    {
        pattern: '/release-templates/edit/:templateId',
        useName: useReleaseTemplateName,
    },
    { pattern: '/tag-types/edit/:name', useName: namedInUrl('name') },
    { pattern: '/segments/edit/:segmentId', useName: useSegmentName },
    { pattern: '/admin/users/:id/edit', useName: useUserName },
    { pattern: '/admin/users/:id/access', useName: useUserName },
    {
        pattern: '/admin/groups/:groupId/*',
        except: ['/admin/groups/create-group'],
        useName: useGroupName,
    },
];

const decodePathSegment = (segment: string): string => {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
};

const decodeParams = (
    params: Record<string, string | undefined>,
): EntityParams =>
    Object.fromEntries(
        Object.entries(params).map(([key, value]) => [
            key,
            decodePathSegment(value ?? ''),
        ]),
    );

export const findEntityPage = (pathname: string): EntityPage | undefined =>
    entityPages
        .filter(
            ({ except = [] }) =>
                !except.some((path) => matchPath(path, pathname)),
        )
        .flatMap(({ pattern, useName }) => {
            const match = matchPath(pattern, pathname);
            return match
                ? [
                      {
                          pattern,
                          to: match.pathnameBase,
                          params: decodeParams(match.params),
                          useName,
                      },
                  ]
                : [];
        })[0];

const useNoName: UseEntityName = () => undefined;

export const useEntityName = (entityPage?: EntityPage): string | undefined => {
    const useName = entityPage?.useName ?? useNoName;

    return useName(entityPage?.params ?? {});
};
