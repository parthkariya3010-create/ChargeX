package com.chargegrid.routes

import com.chargegrid.dto.*
import com.chargegrid.services.AuthService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.authRoutes() {
    val authService = AuthService()

    post("/api/auth/signup") {
        try {
            val request = call.receive<SignupRequest>()
            val response = authService.signup(request)
            call.respond(HttpStatusCode.Created, response)
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Signup failed"))
        }
    }

    post("/api/auth/login") {
        try {
            val request = call.receive<LoginRequest>()
            val response = authService.login(request)
            call.respond(HttpStatusCode.OK, response)
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse(e.message ?: "Login failed"))
        }
    }
}
