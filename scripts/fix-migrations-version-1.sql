CREATE TABLE migrations ( id SERIAL NOT NULL, name CHARACTER VARYING(255) NOT NULL, run_on TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY (id) );
insert into migrations (id, name, run_on) values (1, '/20141020151056-initial-schema', '2016-12-23 10:08:28');
insert into migrations (id, name, run_on) values (2, '/20141110144153-add-description-to-features', '2016-12-23 10:08:31');
insert into migrations (id, name, run_on) values (3, '/20141117200435-add-parameters-template-to-strategies', '2016-12-23 10:08:32');
insert into migrations (id, name, run_on) values (4, '/20141117202209-insert-default-strategy', '2016-12-23 10:08:36');
insert into migrations (id, name, run_on) values (5, '/20141118071458-default-strategy-event', '2016-12-23 10:10:35');
insert into migrations (id, name, run_on) values (6, '/20141215210141-005-archived-flag-to-features', '2016-12-23 10:10:39');
insert into migrations (id, name, run_on) values (7, '/20150210152531-006-rename-eventtype', '2016-12-23 10:10:48');
ALTER SEQUENCE migrations_id_seq restart 8