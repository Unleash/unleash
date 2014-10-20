// TEMPORARY USE OF GRUNT FOR DB MIGRATIONS

var dbUrl = process.env.DB_URL || 'postgresql://localhost:5432/unleash';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-liquibase');

    grunt.initConfig({
        liquibase : {
            options: {
                username: '',
                password: '',
                url : 'jdbc:' + dbUrl,
                changeLogFile: 'sql/db_changes/db.changelog-master.xml'
            },
            update: {
                command: 'update'
            },
            dropAll: {
                command: 'dropAll'
            },
            version : {
                command: 'version'
            }
        }
    });

    grunt.registerTask('default', []);
};

