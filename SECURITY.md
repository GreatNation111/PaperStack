# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in PaperStack, **please do not open a public GitHub issue.**

Instead, report it privately by contacting the maintainer:

- **Email:** *(to be added by maintainer)*
- **Subject line:** `[SECURITY] PaperStack vulnerability report`

Please include:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fix, if applicable

## What Counts as a Security Issue

- Authentication bypass or privilege escalation
- Firestore Security Rules that allow unauthorized data access
- Firebase Storage rules that expose private files
- Cross-site scripting (XSS) in rendered content
- Exposure of Firebase Admin SDK credentials or server secrets
- Any issue that could compromise user data or privacy

## Response

The maintainer will acknowledge your report within 48 hours and work with you to understand and resolve the issue. Security fixes will be prioritized over feature work.

## Scope

This policy applies to the PaperStack application code and its Firebase configuration. It does not cover third-party services (Firebase, Vercel, Google Cloud) — those should be reported through their respective security channels.

## Thank You

We appreciate the security research community's efforts in helping keep PaperStack and its users safe.
