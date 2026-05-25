import type { Db } from '../../db/db.js';
import { generateImageUrl } from '../../util/index.js';
import type {
    IProjectMembersReadModel,
    ProjectMember,
} from './project-members-read-model.type.js';

const MEMBERS_PREVIEW_SIZE = 4;

export class ProjectMembersReadModel implements IProjectMembersReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    static membersUnion(db: Db) {
        return db
            .select('user_id', 'project')
            .from('role_user')
            .leftJoin('roles', 'role_user.role_id', 'roles.id')
            .where((b) => b.whereNot('type', 'root'))
            .union((qb) => {
                qb.select('user_id', 'project')
                    .from('group_role')
                    .leftJoin(
                        'group_user',
                        'group_user.group_id',
                        'group_role.group_id',
                    );
            })
            .as('query');
    }

    async getMembersPreviewByProject(): Promise<
        Record<string, ProjectMember[]>
    > {
        const membersUnion = ProjectMembersReadModel.membersUnion(this.db);

        // Take the first N members of each project, ordered by user id.
        const selectedMembers = this.db
            .select(
                'query.project',
                'users.name',
                'users.username',
                'users.email',
                'users.image_url',
            )
            .rowNumber('rn', 'users.id', 'query.project')
            .from(membersUnion)
            .leftJoin('users', 'users.id', 'query.user_id')
            .whereNotNull('users.id')
            .as('selected_members');

        const rows = await this.db
            .select('*')
            .from(selectedMembers)
            .where('rn', '<=', MEMBERS_PREVIEW_SIZE);

        const membersByProject: Record<string, ProjectMember[]> = {};
        for (const row of rows) {
            const project = row.project as string;
            if (!project) continue;
            if (!membersByProject[project]) {
                membersByProject[project] = [];
            }
            membersByProject[project].push({
                name: row.name || row.username || row.email,
                email: row.email,
                imageUrl: generateImageUrl(row),
            });
        }

        return membersByProject;
    }
}
