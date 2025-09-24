# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS backend-build
WORKDIR /app/backend

COPY backend/*.csproj ./
RUN dotnet restore

COPY backend/ ./
RUN dotnet publish -c Release -o out

# Stage 3: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app

# Copy published backend output
COPY --from=backend-build /app/backend/out ./

# Copy React build output into wwwroot to serve as static files
COPY --from=frontend-build /app/frontend/build ./wwwroot

# Set environment variable to listen on the container port
ENV ASPNETCORE_URLS=http://+:${PORT:-80}

# Expose port (default 80 or from PORT env)
EXPOSE ${PORT:-80}

# Run the backend application
ENTRYPOINT ["dotnet", "YourBackend.dll"]
