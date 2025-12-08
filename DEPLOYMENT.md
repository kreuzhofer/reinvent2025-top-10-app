# Deployment Guide

This guide explains how to deploy the AWS re:Invent 2025 Quiz App using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2 (using `docker compose` command, not `docker-compose`)
- A web server with ports 80 (and optionally 443 for HTTPS)

## Quick Start

### 1. Build and Start the Application

```bash
docker compose up -d --build
```

This command will:
- Build the Docker image using the multi-stage Dockerfile
- Create and start the container
- Expose the application on port 80

### 2. Verify the Deployment

Check that the container is running:

```bash
docker compose ps
```

View the logs:

```bash
docker compose logs -f frontend
```

### 3. Access the Application

Open your browser and navigate to:
- `http://localhost` (local deployment)
- `http://your-server-ip` (remote deployment)

## Common Operations

### Rebuild After Code Changes

**IMPORTANT**: After making any code changes, you MUST rebuild the container:

```bash
docker compose up -d --build
```

Simply restarting the container will NOT pick up code changes because the container uses a compiled version from the build step.

### View Logs

```bash
# Follow logs in real-time
docker compose logs -f frontend

# View last 100 lines
docker compose logs --tail=100 frontend
```

### Stop the Application

```bash
docker compose down
```

### Restart the Application

```bash
docker compose restart frontend
```

Note: This only restarts the container with existing code. Use `--build` to pick up code changes.

## Architecture

The deployment uses a multi-stage Docker build:

1. **Build Stage** (Node.js 20 Alpine)
   - Installs dependencies
   - Builds the Vite application
   - Outputs to `dist/` directory

2. **Production Stage** (Nginx Alpine)
   - Copies built files from build stage
   - Serves static files via Nginx
   - Handles SPA routing (fallback to index.html)
   - Enables gzip compression
   - Sets cache headers for static assets

## Configuration

### Port Mapping

By default, the application is exposed on port 80. To change this, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

### Environment Variables

Environment variables can be added to `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VAR=value
```

### Nginx Configuration

The Nginx configuration is in `nginx.conf`. Key features:

- **SPA Routing**: All routes fallback to `index.html` for client-side routing
- **Gzip Compression**: Enabled for text-based files
- **Cache Headers**: Static assets cached for 1 year
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

## HTTPS Setup (Optional)

For production deployments, you should use HTTPS. Here are two common approaches:

### Option 1: Reverse Proxy (Recommended)

Use a reverse proxy like Nginx or Traefik in front of the application:

```yaml
# docker-compose.yml
services:
  frontend:
    # ... existing config ...
    expose:
      - "80"
    networks:
      - web

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./proxy.conf:/etc/nginx/conf.d/default.conf
    networks:
      - web

networks:
  web:
```

### Option 2: Let's Encrypt with Certbot

Use Certbot to obtain SSL certificates and configure Nginx:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Container Won't Start

Check the logs:
```bash
docker compose logs frontend
```

Common issues:
- Port 80 already in use: Change the port mapping in `docker-compose.yml`
- Build errors: Ensure all dependencies are correctly specified in `package.json`

### Application Not Loading

1. Verify the container is running:
   ```bash
   docker compose ps
   ```

2. Check Nginx logs:
   ```bash
   docker compose logs frontend
   ```

3. Verify the build output exists:
   ```bash
   docker compose exec frontend ls -la /usr/share/nginx/html
   ```

### Code Changes Not Reflected

Remember to rebuild the container:
```bash
docker compose up -d --build
```

### Permission Issues

If you encounter permission issues, ensure Docker has the necessary permissions:
```bash
sudo usermod -aG docker $USER
```

Then log out and back in.

## Production Checklist

Before deploying to production:

- [ ] Set up HTTPS with valid SSL certificates
- [ ] Configure firewall rules (allow ports 80 and 443)
- [ ] Set up monitoring and logging
- [ ] Configure automatic container restarts (`restart: always` in docker-compose.yml)
- [ ] Set up regular backups (if storing any data)
- [ ] Review and harden Nginx security headers
- [ ] Test the application thoroughly
- [ ] Set up a CI/CD pipeline for automated deployments

## Monitoring

### Health Check

Add a health check to `docker-compose.yml`:

```yaml
services:
  frontend:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Resource Limits

Set resource limits to prevent container from consuming too many resources:

```yaml
services:
  frontend:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Updating the Application

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker compose up -d --build
   ```

3. Verify the update:
   ```bash
   docker compose logs -f frontend
   ```

## Backup and Restore

Since this is a static application with no database, backups are primarily for the source code and configuration:

```bash
# Backup
tar -czf reinvent-quiz-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .

# Restore
tar -xzf reinvent-quiz-backup-YYYYMMDD.tar.gz
docker compose up -d --build
```

## Support

For issues or questions:
1. Check the logs: `docker compose logs frontend`
2. Review this deployment guide
3. Check the main README.md for application-specific information
