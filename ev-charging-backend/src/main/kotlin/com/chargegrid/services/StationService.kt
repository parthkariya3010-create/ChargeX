package com.chargegrid.services

import com.chargegrid.dto.*
import com.chargegrid.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDate
import kotlin.math.*

class StationService {

    private val STATUS_AVAILABLE = "available"
    private val STATUS_WAITING = "waiting"
    private val STATUS_FULL = "full"

    fun getStations(userLat: Double? = null, userLng: Double? = null): List<StationResponse> = transaction {
        Stations.selectAll().map { row ->
            val stationId = row[Stations.id]
            val ports = getPortsForStation(stationId)
            val amenities = getAmenitiesForStation(stationId)
            val (status, waitMins) = deriveStationStatus(ports)

            val lat = row[Stations.latitude]?.toDouble()
            val lng = row[Stations.longitude]?.toDouble()
            val distanceKm = if (userLat != null && userLng != null && lat != null && lng != null) {
                haversineKm(userLat, userLng, lat, lng)
            } else null

            StationResponse(
                id = stationId,
                name = row[Stations.name],
                address = row[Stations.address],
                city = row[Stations.city],
                latitude = lat,
                longitude = lng,
                distanceKm = distanceKm,
                rating = row[Stations.rating]?.toDouble(),
                status = status,
                waitMins = waitMins,
                amenities = amenities,
                ports = ports
            )
        }
    }

    fun getStationById(stationId: String, userLat: Double? = null, userLng: Double? = null): StationResponse? = transaction {
        val row = Stations.selectAll().where { Stations.id eq stationId }.singleOrNull() ?: return@transaction null

        val ports = getPortsForStation(stationId)
        val amenities = getAmenitiesForStation(stationId)
        val (status, waitMins) = deriveStationStatus(ports)

        val lat = row[Stations.latitude]?.toDouble()
        val lng = row[Stations.longitude]?.toDouble()
        val distanceKm = if (userLat != null && userLng != null && lat != null && lng != null) {
            haversineKm(userLat, userLng, lat, lng)
        } else null

        StationResponse(
            id = stationId,
            name = row[Stations.name],
            address = row[Stations.address],
            city = row[Stations.city],
            latitude = lat,
            longitude = lng,
            distanceKm = distanceKm,
            rating = row[Stations.rating]?.toDouble(),
            status = status,
            waitMins = waitMins,
            amenities = amenities,
            ports = ports
        )
    }

    private fun haversineKm(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val R = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLng / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return (R * c).roundToInt().toDouble()
    }

    fun getAvailableSlots(stationId: String, portId: String, date: String): List<SlotResponse> = transaction {
        val slots = mutableListOf<SlotResponse>()
        val targetDate = LocalDate.parse(date)

        val bookedTimes = Bookings.selectAll()
            .where {
                (Bookings.stationId eq stationId) and
                (Bookings.portId eq portId) and
                (Bookings.date eq targetDate) and
                (Bookings.status neq "cancelled")
            }
            .map { it[Bookings.startTime].toString().substring(0, 5) }
            .toSet()

        for (hour in 6 until 22) {
            for (minute in listOf(0, 30)) {
                val startTime = "%02d:%02d".format(hour, minute)
                slots.add(
                    SlotResponse(
                        startTime = startTime,
                        available = startTime !in bookedTimes
                    )
                )
            }
        }

        slots
    }

    private fun getPortsForStation(stationId: String): List<PortResponse> {
        return Ports.selectAll().where { Ports.stationId eq stationId }.map { row ->
            PortResponse(
                id = row[Ports.id],
                type = row[Ports.type],
                powerKw = row[Ports.powerKw],
                pricePerKwh = row[Ports.pricePerKwh].toDouble(),
                status = row[Ports.status],
                waitMins = row[Ports.waitMins]
            )
        }
    }

    private fun getAmenitiesForStation(stationId: String): List<String> {
        return StationAmenities.selectAll()
            .where { StationAmenities.stationId eq stationId }
            .map { it[StationAmenities.amenity] }
    }

    private fun deriveStationStatus(ports: List<PortResponse>): Pair<String, Int> {
        val hasAvailable = ports.any { it.status == STATUS_AVAILABLE }
        if (hasAvailable) return STATUS_AVAILABLE to 0

        val waitingPorts = ports.filter { it.status == STATUS_WAITING }
        if (waitingPorts.isNotEmpty()) {
            val minWait = waitingPorts.minOf { it.waitMins }
            return STATUS_WAITING to minWait
        }

        return STATUS_FULL to 0
    }
}
