[1mdiff --git a/src/lib/db/feature-toggle-store.ts b/src/lib/db/feature-toggle-store.ts[m
[1mindex 4fe1d162..480c55fa 100644[m
[1m--- a/src/lib/db/feature-toggle-store.ts[m
[1m+++ b/src/lib/db/feature-toggle-store.ts[m
[36m@@ -236,7 +236,7 @@[m [mexport default class FeatureToggleStore implements IFeatureToggleStore {[m
         const now = new Date();[m
         const row = await this.db(TABLE)[m
             .where({ name })[m
[31m-            .update({ archived: true, archived_at: now })[m
[32m+[m[32m            .update({ archived_at: now })[m
             .returning(FEATURE_COLUMNS);[m
         return this.rowToFeature(row[0]);[m
     }[m
[36m@@ -250,7 +250,7 @@[m [mexport default class FeatureToggleStore implements IFeatureToggleStore {[m
     async revive(name: string): Promise<FeatureToggle> {[m
         const row = await this.db(TABLE)[m
             .where({ name })[m
[31m-            .update({ archived: false, archived_at: null })[m
[32m+[m[32m            .update({ archived_at: null })[m
             .returning(FEATURE_COLUMNS);[m
         return this.rowToFeature(row[0]);[m
     }[m
[1mdiff --git a/src/migrations/20220603081324-add-archive-at-to-feature-toggle.js b/src/migrations/20220603081324-add-archive-at-to-feature-toggle.js[m
[1mindex 0d636b4b..c84ee131 100644[m
[1m--- a/src/migrations/20220603081324-add-archive-at-to-feature-toggle.js[m
[1m+++ b/src/migrations/20220603081324-add-archive-at-to-feature-toggle.js[m
[36m@@ -1,9 +1,39 @@[m
 'use strict';[m
 [m
 exports.up = function (db, callback) {[m
[31m-    db.runSql('ALTER TABLE features ADD "archived_at" date;', callback);[m
[32m+[m[32m    db.runSql([m
[32m+[m[32m        `[m
[32m+[m[32m        ALTER TABLE features ADD "archived_at" date;[m
[32m+[m[32m        UPDATE features f[m
[32m+[m[32m        SET    archived_at = res.archived_at[m
[32m+[m[32m            FROM   (SELECT f.name, e.created_at AS archived_at[m
[32m+[m[32m        FROM   features f[m
[32m+[m[32m               INNER JOIN events e[m
[32m+[m[32m                       ON e.feature_name = f.NAME[m
[32m+[m[32m                          AND e.created_at =[m
[32m+[m[32m                              (SELECT Max(created_at) date[m
[32m+[m[32m                               FROM   events[m
[32m+[m[32m                               WHERE  type = 'feature-archived'[m
[32m+[m[32m                                      AND e.feature_name = f.NAME)) res[m
[32m+[m[32m        WHERE  res.NAME = f.NAME;[m
[32m+[m[32m        UPDATE features[m
[32m+[m[32m        SET    archived_at = Now()[m
[32m+[m[32m        WHERE  archived = TRUE[m
[32m+[m[32m          AND archived_at IS NULL;[m
[32m+[m[32m        ALTER TABLE features DROP COLUMN archived;[m
[32m+[m[32m        `,[m
[32m+[m[32m        callback,[m
[32m+[m[32m    );[m
 };[m
 [m
 exports.down = function (db, callback) {[m
[31m-    db.runSql('ALTER TABLE features DROP COLUMN "archived_at";', callback);[m
[32m+[m[32m    db.runSql([m
[32m+[m[32m        `[m
[32m+[m[32m        UPDATE features[m
[32m+[m[32m        SET    archived = TRUE[m
[32m+[m[32m        WHERE  archived_at IS NOT NULL;[m
[32m+[m[32m        ALTER TABLE features DROP COLUMN archived_at;[m
[32m+[m[32m        `,[m
[32m+[m[32m        callback,[m
[32m+[m[32m    );[m
 };[m
[1mdiff --git a/src/test/e2e/api/admin/feature.e2e.test.ts b/src/test/e2e/api/admin/feature.e2e.test.ts[m
[1mindex 3226222b..814751df 100644[m
[1m--- a/src/test/e2e/api/admin/feature.e2e.test.ts[m
[1m+++ b/src/test/e2e/api/admin/feature.e2e.test.ts[m
[36m@@ -25,7 +25,7 @@[m [mbeforeAll(async () => {[m
     app = await setupApp(db.stores);[m
 [m
     const createToggle = async ([m
[31m-        toggle: Omit<FeatureSchema, 'createdAt'>,[m
[32m+[m[32m        toggle: Omit<FeatureSchema, 'archivedAt' | 'createdAt'>,[m
         strategy: Omit<FeatureStrategySchema, 'id'> = defaultStrategy,[m
         projectId: string = 'default',[m
         username: string = 'test',[m
