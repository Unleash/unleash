exports.up = function(db, cb) {
    db.runSql(
        `
          CREATE OR REPLACE FUNCTION bucket_edge_heartbeat(ts timestamptz)
          RETURNS timestamptz
          LANGUAGE SQL IMMUTABLE PARALLEL SAFE AS $$
            SELECT to_timestamp(floor(extract(epoch FROM ts) / 300) * 300) AT TIME ZONE 'UTC';
          $$;

          CREATE TABLE edge_node_presence (
            bucket_ts     timestamptz NOT NULL,
            node_ephem_id text        NOT NULL,
            PRIMARY KEY (bucket_ts, node_ephem_id)
          );

          CREATE INDEX edge_node_presence_brin ON edge_node_presence USING BRIN (bucket_ts);
          CREATE INDEX edge_node_presence_node_hash ON edge_node_presence USING HASH (node_ephem_id);

        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
          DROP INDEX IF EXISTS edge_node_presence_brin;
          DROP INDEX IF EXISTS edge_node_presence_node_hash;
          DROP TABLE IF EXISTS edge_node_presence;
          DROP FUNCTION IF EXISTS bucket_edge_heartbeat(timestamptz);
        `,
        cb,
    );
};
