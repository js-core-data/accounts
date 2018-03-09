# nappjs-accounts

Microservice for managing user accounts and permissions with OAuth2 support.

# URLs

* `/auth` - OAuth authorization url
* `/auth/token` - OAuth token url
* `/auth/certs` - path for fetching certificates used for signing (if JWT_SECRET isn't set)

# OAuth2 supported grants

## password grant

```
curl -X POST \
  https://accounts.example.com/auth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&client_secret=blah&client_id=foo&username=john.doe%40example.com&password=supersecret'
```

## client_credentials grant

```
curl -X POST \
  https://accounts.example.com/auth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_secret=blah&client_id=foo'
```
