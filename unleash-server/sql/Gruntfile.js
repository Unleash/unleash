var dbPort = (process.env.BOXEN_POSTGRESQL_PORT || '5432');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-liquibase');

    grunt.initConfig({
        liquibase : {
            options: {
                username : '',
                password : '',
                url : 'jdbc:postgresql://localhost:' + dbPort + '/unleash',
                changeLogFile: 'db_changes/db.changelog-master.xml'
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

