exports.up = function(db, cb) {
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
        VALUES ('Admin', 'Can read and write all resources in Unleash. This includes add and remove users and roles.', 'root')
        RETURNING id role_id
      )

      INSERT INTO role_permission(role_id, permission) 
      SELECT role_id, 'ADMIN' from admin;

      WITH regular AS (
        INSERT INTO roles(name, description, type)
        VALUES ('Regular', 'Can read and write all root resources in Unleash, except users and roles. Users with this role can also create new projects.', 'root')
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

exports.down = function(db, cb) {
    db.runSql(
        `
      DROP TABLE role_user;
      DROP TABLE role_permission;
      DROP TABLE roles;
      `,
        cb,
    );
};
