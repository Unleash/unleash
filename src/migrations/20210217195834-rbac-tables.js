exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS roles
       (
          id          SERIAL PRIMARY KEY,
          name        text not null,
          description text,
          type        text not null default 'custom',
          project     text,
          created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
       );
      CREATE TABLE IF NOT EXISTS role_user
      (
          role_id     integer not null references roles (id) ON DELETE CASCADE,
          user_id     integer not null references users (id) ON DELETE CASCADE,
          created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
          PRIMARY KEY (role_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS role_permission
      (
          role_id     integer not null references roles (id) ON DELETE CASCADE,
          project     text,
          permission  text not null,
          created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    
      WITH admin AS (
        INSERT INTO roles(name, description, type)
        VALUES ('Admin', 'Users with the global admin role have superuser access to Unleash and can perform any operation within the unleash platform.', 'root')
        RETURNING id role_id
      )

      INSERT INTO role_permission(role_id, permission) 
      SELECT role_id, 'ADMIN' from admin;

      WITH regular AS (
        INSERT INTO roles(name, description, type)
        VALUES ('Regular', 'Users with the global regular role have access most features in Unleash, but can not manage users and roles in the global scope. If a user with a global regular role creates a project, they will become a project admin and receive superuser rights within the context of that project.', 'root')
        RETURNING id role_id
      )
      INSERT INTO role_permission(role_id, project, permission)
      VALUES
        ((SELECT role_id from regular), '', 'CREATE_STRATEGY'),
        ((SELECT role_id from regular), '', 'UPDATE_STRATEGY'),
        ((SELECT role_id from regular), '', 'DELETE_STRATEGY'),

        ((SELECT role_id from regular), '', 'UPDATE_APPLICATION'),

        ((SELECT role_id from regular), '', 'CREATE_CONTEXT_FIELD'),
        ((SELECT role_id from regular), '', 'UPDATE_CONTEXT_FIELD'),
        ((SELECT role_id from regular), '', 'DELETE_CONTEXT_FIELD'),
        
        ((SELECT role_id from regular), '', 'CREATE_PROJECT'),

        ((SELECT role_id from regular), '', 'CREATE_ADDON'),
        ((SELECT role_id from regular), '', 'UPDATE_ADDON'),
        ((SELECT role_id from regular), '', 'DELETE_ADDON'),
      
        ((SELECT role_id from regular), 'default', 'UPDATE_PROJECT'),
        ((SELECT role_id from regular), 'default', 'DELETE_PROJECT'),
        ((SELECT role_id from regular), 'default', 'CREATE_FEATURE'),
        ((SELECT role_id from regular), 'default', 'UPDATE_FEATURE'),
        ((SELECT role_id from regular), 'default', 'DELETE_FEATURE');
      
      INSERT INTO roles(name, description, type)
      VALUES ('Read', 'Users with this role can only read root resources in Unleash. They may be added as collaborator to specific projects.', 'root');
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      DROP TABLE role_user;
      DROP TABLE role_permission;
      DROP TABLE roles;
      `,
        cb,
    );
};
