# [GET Tools](https://cabalex.github.io/get-tools)
Tools for interacting with CBORD's GET app, featuring:
- Detailed spending analytics
- QR code generation
- Code sharing

## Security
Since CBORD's API is exposed with CORS headers, the app works by directly sending requests to the GET API. No information is ever sent to a third party server.

When sharing codes, a new "device" is created with a specific ID and PIN, which is able to be shared and revoked at any time. Since there isn't any way to only partially access an account, it is possible to get full account access through these codes, so only share them with people you trust!