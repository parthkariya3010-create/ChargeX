package com.chargegrid.routes

import com.chargegrid.dto.*
import com.chargegrid.services.ProfileService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.profileRoutes() {
    val profileService = ProfileService()

    authenticate("auth-jwt") {
        get("/api/profile") {
            val userId = call.principal<JWTPrincipal>()?.payload?.subject?.toLong()
                ?: return@get call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))

            try {
                val profile = profileService.getProfile(userId)
                call.respond(HttpStatusCode.OK, profile)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse(e.message ?: "Profile not found"))
            }
        }

        put("/api/profile") {
            val userId = call.principal<JWTPrincipal>()?.payload?.subject?.toLong()
                ?: return@put call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))

            try {
                val request = call.receive<UpdateProfileRequest>()
                val profile = profileService.updateProfile(userId, request)
                call.respond(HttpStatusCode.OK, profile)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Update failed"))
            }
        }
    }
}
