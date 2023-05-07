{ pkgs, ... }:

{
  # https://devenv.sh/packages/
  packages = [
    pkgs.nodejs-18_x
    pkgs.postgresql_14
    pkgs.yarn
  ];

  # https://devenv.sh/processes/
  processes = {
    yarn-build-watch.exec = "yarn build:watch";
    yarn-start-dev.exec = "yarn start:dev";
  };

  # https://devenv.sh/reference/options/#servicespostgresenable
  services.postgres.enable = true;
  services.postgres.listen_addresses = "127.0.0.1";

  services.postgres.createDatabase = true;
  services.postgres.initdbArgs = [
    "--locale=C"
    "--encoding=UTF8"
  ];

  services.postgres.initialDatabases = [{ name = "unleash"; }];
  services.postgres.initialScript = ''
    CREATE USER postgres SUPERUSER;
    CREATE USER unleash_user;
  '';

  # https://devenv.sh/languages/  
  languages.javascript.enable = true;
  languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.prettier.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
