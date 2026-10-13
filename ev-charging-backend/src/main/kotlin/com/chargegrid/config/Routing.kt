package com.chargegrid.config

import com.chargegrid.routes.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respond(mapOf(
                "name" to "CHARGEX EV Charging Backend API",
                "version" to "1.0.0",
                "status" to "online",
                "docs" to "Use /api/stations or /api/health",
                "endpoints" to listOf(
                    "/api/health",
                    "/api/stations",
                    "/api/auth/login",
                    "/api/bookings",
                    "/api/admin/stats"
                )
            ))
        }

        get("/api/health") {
            call.respond(mapOf("status" to "ok"))
        }

        authRoutes()
        stationRoutes()
        bookingRoutes()
        profileRoutes()
        adminRoutes()
    }
}
