exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS tag_types
         (
             name        text PRIMARY KEY NOT NULL,
             description text,
             icon        text,
             created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
         );
        CREATE TABLE IF NOT EXISTS tags
        (
            type  text not null references tag_types (name) ON DELETE CASCADE,
            value text,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            PRIMARY KEY (type, value)
        );
        CREATE TABLE IF NOT EXISTS feature_tag
        (
            feature_name varchar(255) not null references features (name) ON DELETE CASCADE,
            tag_type       text not null,
            tag_value      text not null,
            created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE (feature_name, tag_type, tag_value),
            FOREIGN KEY (tag_type, tag_value) REFERENCES tags(type, value) ON DELETE CASCADE
        );
        INSERT INTO tag_types(name, description, icon)
        VALUES ('simple', 'Used to simplify filtering of features', '#');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DROP TABLE feature_tag;
        DROP TABLE tags;
        DROP TABLE tag_types;
        `,
        cb,
    );
};
