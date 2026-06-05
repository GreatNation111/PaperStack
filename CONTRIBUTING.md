# Contributing to PaperStack

Thank you for your interest in contributing to PaperStack! This guide will help you get started.

## Getting Started

### 1. Fork the Repository

Click the **Fork** button in the top-right corner of the [PaperStack repository](https://github.com/yourusername/paperstack) to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/paperstack.git
cd paperstack
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase project credentials in `.env.local`. See the [README](README.md) for details on setting up a Firebase project.

### 5. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Making Changes

### Branch Naming

Create a descriptive branch for your work:

```bash
git checkout -b fix/pdf-viewer-loading
git checkout -b feature/course-search-filter
git checkout -b docs/update-setup-guide
```

Use prefixes like `fix/`, `feature/`, `docs/`, `refactor/`, or `chore/`.

### Code Style

- Use TypeScript for all new code.
- Follow the existing patterns in the codebase.
- Use meaningful variable and function names.
- Keep components focused and reasonably sized.
- Do not introduce new linting or formatting tools without discussion.

### Commit Messages

Write clear, descriptive commit messages:

```
fix: resolve PDF viewer blank page on mobile Safari
feature: add department filter to course search
docs: update Firebase setup instructions
```

## Pull Requests

1. Make sure your branch is up to date with `main`.
2. Run `npm run build` to confirm the app builds without errors.
3. Write a clear PR description explaining what you changed and why.
4. Reference any related issues (e.g., `Closes #12`).
5. Keep PRs focused — one feature or fix per PR.

## Opening Issues

- Use the provided issue templates when available.
- For bugs, include steps to reproduce, expected behavior, and actual behavior.
- For feature requests, explain the use case and who benefits.
- Search existing issues before opening a new one.

## Important Rules

> **⚠️ Do not upload copyrighted, private, or restricted academic materials into this repository.**
>
> PaperStack is an open-source platform. The repository contains only the application code, not the academic content. Real past questions, exam papers, and course materials are stored in Firebase Storage and are managed by authorized administrators — they are never committed to this repository.

> **⚠️ Do not commit secrets or credentials.**
>
> Never commit `.env.local`, Firebase service account keys, API secrets, or any private credentials. If you accidentally commit sensitive data, notify the maintainer immediately.

## Questions?

If you're unsure about anything, open a GitHub issue and ask. We're happy to help.
