# Docker Container Rebuild Requirement

When making code changes to this project, the Docker container must be rebuilt to pick up the changes.

## Commands

After modifying source code files, run:

```bash
docker compose up -d --build app
```

Or to rebuild all services:

```bash
docker compose up -d --build
```

## Why This Is Needed

The application runs inside a Docker container in production mode. The container uses a compiled version of the code from the build step. Simply restarting the container with `docker compose restart app` will not pick up new code changes - the container must be rebuilt.

## Workflow

1. Make code changes
2. Run `docker compose up -d --build app`
3. Wait for the build to complete
4. Test the changes

## Alternative for Development

For faster iteration during development, consider:
- Running the app locally with `npm run dev` (if available)
- Using Docker volumes to mount source code (requires Dockerfile changes)
- Setting up hot-reload in the container
