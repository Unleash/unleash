# /perf

Testing performance testing! Files of note:

```shell
# Configure the app URL and auth token to use in performance testing.
./env.sh

# Export all the data from the app at the configured URL.
./seed/export.sh

# Import previously exported data to the app instance.
./seed/import.sh

# Measure the GZIP response size for interesting endpoints.
./test/gzip.sh

# Run a few load test scenarios against the app.
./test/artillery.sh
```

See also the following scripts in `package.json`:

```shell
# Fill the unleash_testing/seed schema with seed data.
$ yarn seed:setup

# Serve the unleash_testing/seed schema data, for exports.
$ yarn seed:serve
```

Edit files in `/test/e2e/seed` to change the amount data. 
