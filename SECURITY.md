# Security policy

## Supported versions

This project is a static browser application. Security fixes are applied to the latest state of `main` and the latest deployed version.

## Reporting a vulnerability

Please do not report security vulnerabilities through a public issue or pull request.

Use GitHub's private vulnerability reporting form:

https://github.com/Rafache/capacity/security/advisories/new

If private vulnerability reporting is unavailable, contact [@Rafache](https://github.com/Rafache) through GitHub before sharing sensitive details publicly.

Include:

- a short description and impact;
- steps to reproduce or a minimal proof of concept;
- the affected version or commit;
- any suggested mitigation.

I will acknowledge valid reports as soon as practical and coordinate disclosure after a fix is available.

## Scope

The application has no backend, authentication, account system, analytics or server-side data store. Reports about the static client, build and deployment configuration, dependencies, and repository workflows are in scope.

Do not include real personal data in a report. Browser `localStorage` is not encrypted and must not contain secrets or sensitive information.
