package com.chargegrid.routes

import com.chargegrid.config.getUserRole
import com.chargegrid.dto.*
import com.chargegrid.services.AdminService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.adminRoutes() {
    val adminService = AdminService()

    authenticate("auth-jwt") {
        get("/api/admin/stats") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@get call.respond(HttpStatusCode.Forbidden, ErrorResponse("Admin or Host role required"))
            }

            val stats = adminService.getStats()
            call.respond(HttpStatusCode.OK, stats)
        }

        get("/api/admin/bookings") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@get call.respond(HttpStatusCode.Forbidden, ErrorResponse("Admin or Host role required"))
            }

            val status = call.request.queryParameters["status"]
            val bookings = adminService.getAllBookings(status)
            call.respond(HttpStatusCode.OK, bookings)
        }

        patch("/api/admin/bookings/{id}/status") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@patch call.respond(HttpStatusCode.Forbidden, ErrorResponse("Admin or Host role required"))
            }

            val bookingId = call.parameters["id"] ?: return@patch
            val request = call.receive<UpdateBookingStatusRequest>()
            val ok = adminService.updateBookingStatus(bookingId, request.status)
            if (ok) {
                call.respond(HttpStatusCode.OK, SuccessResponse("Status updated to ${request.status}"))
            } else {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Booking not found"))
            }
        }

        get("/api/admin/users") {
            val role = call.getUserRole()
            if (role != "ADMIN") {
                return@get call.respond(HttpStatusCode.Forbidden, ErrorResponse("Admin role required"))
            }

            val users = adminService.getAllUsers()
            call.respond(HttpStatusCode.OK, users)
        }
    }
}

