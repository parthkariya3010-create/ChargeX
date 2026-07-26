package com.chargegrid.routes

import com.chargegrid.dto.*
import com.chargegrid.services.BookingService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.bookingRoutes() {
    val bookingService = BookingService()

    authenticate("auth-jwt") {
        post("/api/bookings") {
            try {
                val userId = call.principal<JWTPrincipal>()?.payload?.subject?.toLong()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))

                val request = call.receive<CreateBookingRequest>()
                val booking = bookingService.createBooking(userId, request)
                call.respond(HttpStatusCode.Created, booking)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Booking failed"))
            }
        }

        get("/api/bookings/me") {
            val userId = call.principal<JWTPrincipal>()?.payload?.subject?.toLong()
                ?: return@get call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))

            val bookings = bookingService.getMyBookings(userId)
            call.respond(HttpStatusCode.OK, bookings)
        }

        post("/api/bookings/{id}/cancel") {
            val userId = call.principal<JWTPrincipal>()?.payload?.subject?.toLong()
                ?: return@post call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))

            val bookingId = call.parameters["id"] ?: return@post
            val ok = bookingService.cancelBooking(userId, bookingId)
            if (ok) {
                call.respond(HttpStatusCode.OK, CancelResponse(ok = true))
            } else {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Booking not found"))
            }
        }
    }
}
