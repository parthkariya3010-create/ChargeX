package com.chargegrid.routes

import com.chargegrid.dto.*
import com.chargegrid.services.StationService
import io.ktor.http.*
import io.ktor.server.application.*
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
}
