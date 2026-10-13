FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY ev-charging-backend/ ./
RUN chmod +x ./gradlew && ./gradlew installDist --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/install/ev-charging-backend .

EXPOSE 8080
ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -Xmx350m -Xms128m"

CMD ["bin/ev-charging-backend"]
