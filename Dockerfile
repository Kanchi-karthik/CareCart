# --- STAGE 1: Build Backend ---
FROM maven:3.8.1-openjdk-11 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn package -DskipTests

# --- STAGE 2: Build Frontend ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- STAGE 3: Final Image ---
FROM tomcat:9.0-jdk11-openjdk
COPY --from=backend-build /app/backend/target/carecart.war /usr/local/tomcat/webapps/
EXPOSE 8080
CMD ["catalina.sh", "run"]
