package com.chargegrid.routes

import com.chargegrid.config.getUserId
import com.chargegrid.config.getUserRole
import com.chargegrid.dto.*
import com.chargegrid.services.StationService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.stationRoutes() {
    val stationService = StationService()

    get("/api/stations") {
        val userLat = call.request.queryParameters["lat"]?.toDoubleOrNull()
        val userLng = call.request.queryParameters["lng"]?.toDoubleOrNull()
        val stations = stationService.getStations(userLat, userLng)
        call.respond(HttpStatusCode.OK, stations)
    }

    get("/api/stations/{id}") {
        val stationId = call.parameters["id"] ?: return@get
        val userLat = call.request.queryParameters["lat"]?.toDoubleOrNull()
        val userLng = call.request.queryParameters["lng"]?.toDoubleOrNull()
        val station = stationService.getStationById(stationId, userLat, userLng)
        if (station != null) {
            call.respond(HttpStatusCode.OK, station)
        } else {
            call.respond(HttpStatusCode.NotFound, ErrorResponse("Station not found"))
        }
    }

    get("/api/stations/{id}/ports/{portId}/slots") {
        val stationId = call.parameters["id"] ?: return@get
        val portId = call.parameters["portId"] ?: return@get
        val date = call.request.queryParameters["date"] ?: return@get

        val slots = stationService.getAvailableSlots(stationId, portId, date)
        call.respond(HttpStatusCode.OK, slots)
    }

    authenticate("auth-jwt") {
        post("/api/stations") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@post call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can create stations"))
            }
            try {
                val hostId = call.getUserId()
                val request = call.receive<CreateStationRequest>()
                val station = stationService.createStation(request, hostId)
                call.respond(HttpStatusCode.Created, station)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to create station"))
            }
        }

        put("/api/stations/{id}") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@put call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can update stations"))
            }
            val stationId = call.parameters["id"] ?: return@put
            try {
                val hostId = call.getUserId()
                val request = call.receive<UpdateStationRequest>()
                val station = stationService.updateStation(stationId, request, hostId, role == "ADMIN")
                call.respond(HttpStatusCode.OK, station)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to update station"))
            }
        }

        delete("/api/stations/{id}") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@delete call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can delete stations"))
            }
            val stationId = call.parameters["id"] ?: return@delete
            try {
                val hostId = call.getUserId()
                val ok = stationService.deleteStation(stationId, hostId, role == "ADMIN")
                if (ok) {
                    call.respond(HttpStatusCode.OK, SuccessResponse("Station deleted successfully"))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Station not found"))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to delete station"))
            }
        }

        post("/api/stations/{id}/ports") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@post call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can add ports"))
            }
            val stationId = call.parameters["id"] ?: return@post
            try {
                val request = call.receive<CreatePortRequest>()
                val port = stationService.createPort(stationId, request)
                call.respond(HttpStatusCode.Created, port)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to create port"))
            }
        }

        put("/api/stations/{id}/ports/{portId}") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@put call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can edit ports"))
            }
            val stationId = call.parameters["id"] ?: return@put
            val portId = call.parameters["portId"] ?: return@put
            try {
                val request = call.receive<UpdatePortRequest>()
                val port = stationService.updatePort(stationId, portId, request)
                call.respond(HttpStatusCode.OK, port)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to update port"))
            }
        }

        delete("/api/stations/{id}/ports/{portId}") {
            val role = call.getUserRole()
            if (role != "ADMIN" && role != "HOST") {
                return@delete call.respond(HttpStatusCode.Forbidden, ErrorResponse("Only ADMIN or HOST can delete ports"))
            }
            val stationId = call.parameters["id"] ?: return@delete
            val portId = call.parameters["portId"] ?: return@delete
            try {
                val ok = stationService.deletePort(stationId, portId)
                if (ok) {
                    call.respond(HttpStatusCode.OK, SuccessResponse("Port deleted successfully"))
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Port not found"))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Failed to delete port"))
            }
        }
    }
}
