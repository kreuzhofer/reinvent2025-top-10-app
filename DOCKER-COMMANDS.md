# Docker Commands Quick Reference

This is a quick reference for common Docker commands used with this project.

## Essential Commands

### Build and Start

```bash
# Build and start the application
docker compose up -d --build

# Start without rebuilding (only if no code changes)
docker compose up -d
```

### Stop and Remove

```bash
# Stop the application
docker compose down

# Stop and remove volumes (if any)
docker compose down -v
```

### Restart

```bash
# Restart the container
docker compose restart frontend

# Restart all services
docker compose restart
```

## Viewing Logs

```bash
# Follow logs in real-time
docker compose logs -f frontend

# View last 100 lines
docker compose logs --tail=100 frontend

# View logs from all services
docker compose logs -f
```

## Container Management

```bash
# List running containers
docker compose ps

# List all containers (including stopped)
docker compose ps -a

# Execute command in running container
docker compose exec frontend sh

# View container resource usage
docker stats
```

## Image Management

```bash
# List images
docker images

# Remove unused images
docker image prune

# Remove all unused images (including dangling)
docker image prune -a

# Remove specific image
docker rmi reinvent-quiz-app
```

## Troubleshooting

```bash
# View detailed container information
docker compose ps --format json

# Inspect container
docker inspect reinvent-quiz-app

# View container processes
docker compose top frontend

# Check container health
docker compose ps | grep frontend
```

## Development Workflow

### After Code Changes

```bash
# ALWAYS rebuild after code changes
docker compose up -d --build

# Check logs for errors
docker compose logs -f frontend
```

### Testing the Build

```bash
# Build without starting
docker compose build

# Build with no cache (clean build)
docker compose build --no-cache

# Start after building
docker compose up -d
```

## Cleanup

```bash
# Remove stopped containers
docker compose rm

# Remove all stopped containers, networks, and dangling images
docker system prune

# Remove everything (use with caution!)
docker system prune -a --volumes
```

## Port Management

```bash
# Check which ports are in use
docker compose port frontend 80

# List all port mappings
docker compose ps --format "table {{.Name}}\t{{.Ports}}"
```

## Advanced Commands

### Rebuild Specific Service

```bash
# Rebuild only the frontend service
docker compose build frontend
docker compose up -d frontend
```

### Scale Services (if applicable)

```bash
# Scale to multiple instances
docker compose up -d --scale frontend=3
```

### Export and Import Images

```bash
# Save image to tar file
docker save -o reinvent-quiz-app.tar reinvent-quiz-app

# Load image from tar file
docker load -i reinvent-quiz-app.tar
```

## Environment Variables

```bash
# Pass environment variables
docker compose up -d --env-file .env.production

# Override environment variables
NODE_ENV=production docker compose up -d
```

## Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect reinvent-quiz-app_default

# Connect container to network
docker network connect my-network reinvent-quiz-app
```

## Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect volume-name

# Remove unused volumes
docker volume prune
```

## Common Issues and Solutions

### Port Already in Use

```bash
# Find process using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - "8080:80"
```

### Container Won't Start

```bash
# Check logs for errors
docker compose logs frontend

# Remove and recreate container
docker compose down
docker compose up -d --build --force-recreate
```

### Out of Disk Space

```bash
# Clean up everything
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then test
docker ps
```

## Best Practices

1. **Always use `--build` after code changes**
   ```bash
   docker compose up -d --build
   ```

2. **Check logs after deployment**
   ```bash
   docker compose logs -f frontend
   ```

3. **Use specific tags for production**
   ```yaml
   image: reinvent-quiz-app:v1.0.0
   ```

4. **Set resource limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

5. **Enable health checks**
   ```yaml
   healthcheck:
     test: ["CMD", "wget", "--spider", "http://localhost/"]
     interval: 30s
   ```

## Monitoring

```bash
# Watch container stats in real-time
docker stats reinvent-quiz-app

# View container events
docker events --filter container=reinvent-quiz-app

# Export logs to file
docker compose logs frontend > logs.txt
```

## CI/CD Integration

```bash
# Build for CI/CD
docker compose -f docker-compose.yml build --no-cache

# Push to registry
docker tag reinvent-quiz-app:latest registry.example.com/reinvent-quiz-app:latest
docker push registry.example.com/reinvent-quiz-app:latest

# Pull and deploy on server
docker pull registry.example.com/reinvent-quiz-app:latest
docker compose up -d
```

## Remember

- Use `docker compose` (not `docker-compose`) - this is Docker Compose V2
- Always rebuild after code changes: `docker compose up -d --build`
- Check logs when troubleshooting: `docker compose logs -f frontend`
- Clean up regularly: `docker system prune`
