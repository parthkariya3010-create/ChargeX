package com.chargegrid.services

import com.chargegrid.dto.*
import com.chargegrid.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
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
                hostId = row[Stations.hostId],
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
            hostId = row[Stations.hostId],
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

    fun createStation(request: CreateStationRequest, hostId: Long?): StationResponse = transaction {
        val stationId = request.id ?: "CHX_HUB_${System.currentTimeMillis() % 100000}"
        val exists = Stations.selectAll().where { Stations.id eq stationId }.singleOrNull()
        if (exists != null) {
            throw IllegalArgumentException("Station ID already exists")
        }

        Stations.insert { row ->
            row[Stations.id] = stationId
            row[Stations.name] = request.name
            row[Stations.address] = request.address
            row[Stations.city] = request.city
            row[Stations.latitude] = request.latitude?.let { java.math.BigDecimal.valueOf(it) }
            row[Stations.longitude] = request.longitude?.let { java.math.BigDecimal.valueOf(it) }
            row[Stations.rating] = request.rating?.let { java.math.BigDecimal.valueOf(it) }
            row[Stations.hostId] = hostId
        }

        for (amenity in request.amenities) {
            StationAmenities.insert { row ->
                row[StationAmenities.stationId] = stationId
                row[StationAmenities.amenity] = amenity
            }
        }

        val ports = mutableListOf<PortResponse>()
        for (portReq in request.ports) {
            Ports.insert { row ->
                row[Ports.id] = portReq.id
                row[Ports.stationId] = stationId
                row[Ports.type] = portReq.type
                row[Ports.powerKw] = portReq.powerKw
                row[Ports.pricePerKwh] = java.math.BigDecimal.valueOf(portReq.pricePerKwh)
                row[Ports.status] = portReq.status
                row[Ports.waitMins] = portReq.waitMins
            }
            ports.add(
                PortResponse(
                    id = portReq.id,
                    type = portReq.type,
                    powerKw = portReq.powerKw,
                    pricePerKwh = portReq.pricePerKwh,
                    status = portReq.status,
                    waitMins = portReq.waitMins
                )
            )
        }

        val (status, waitMins) = deriveStationStatus(ports)

        StationResponse(
            id = stationId,
            name = request.name,
            address = request.address,
            city = request.city,
            latitude = request.latitude,
            longitude = request.longitude,
            rating = request.rating,
            hostId = hostId,
            status = status,
            waitMins = waitMins,
            amenities = request.amenities,
            ports = ports
        )
    }

    fun updateStation(stationId: String, request: UpdateStationRequest, hostId: Long?, isAdmin: Boolean): StationResponse = transaction {
        val existing = Stations.selectAll().where { Stations.id eq stationId }.singleOrNull()
            ?: throw IllegalArgumentException("Station not found")

        if (!isAdmin && existing[Stations.hostId] != hostId) {
            throw IllegalArgumentException("Not authorized to modify this station")
        }

        Stations.update({ Stations.id eq stationId }) { row ->
            request.name?.let { row[Stations.name] = it }
            request.address?.let { row[Stations.address] = it }
            request.city?.let { row[Stations.city] = it }
            request.latitude?.let { row[Stations.latitude] = java.math.BigDecimal.valueOf(it) }
            request.longitude?.let { row[Stations.longitude] = java.math.BigDecimal.valueOf(it) }
            request.rating?.let { row[Stations.rating] = java.math.BigDecimal.valueOf(it) }
        }

        request.amenities?.let { newAmenities ->
            StationAmenities.deleteWhere { StationAmenities.stationId eq stationId }
            for (amenity in newAmenities) {
                StationAmenities.insert { row ->
                    row[StationAmenities.stationId] = stationId
                    row[StationAmenities.amenity] = amenity
                }
            }
        }

        getStationById(stationId) ?: throw IllegalStateException("Station could not be re-fetched")
    }

    fun deleteStation(stationId: String, hostId: Long?, isAdmin: Boolean): Boolean = transaction {
        val existing = Stations.selectAll().where { Stations.id eq stationId }.singleOrNull()
            ?: return@transaction false

        if (!isAdmin && existing[Stations.hostId] != hostId) {
            throw IllegalArgumentException("Not authorized to delete this station")
        }

        Bookings.deleteWhere { Bookings.stationId eq stationId }
        Ports.deleteWhere { Ports.stationId eq stationId }
        StationAmenities.deleteWhere { StationAmenities.stationId eq stationId }
        Stations.deleteWhere { Stations.id eq stationId }
        true
    }

    fun createPort(stationId: String, request: CreatePortRequest): PortResponse = transaction {
        Stations.selectAll().where { Stations.id eq stationId }.singleOrNull()
            ?: throw IllegalArgumentException("Station not found")

        val portExists = Ports.selectAll()
            .where { (Ports.stationId eq stationId) and (Ports.id eq request.id) }
            .singleOrNull()
        if (portExists != null) {
            throw IllegalArgumentException("Port ID already exists for this station")
        }

        Ports.insert { row ->
            row[Ports.id] = request.id
            row[Ports.stationId] = stationId
            row[Ports.type] = request.type
            row[Ports.powerKw] = request.powerKw
            row[Ports.pricePerKwh] = java.math.BigDecimal.valueOf(request.pricePerKwh)
            row[Ports.status] = request.status
            row[Ports.waitMins] = request.waitMins
        }

        PortResponse(
            id = request.id,
            type = request.type,
            powerKw = request.powerKw,
            pricePerKwh = request.pricePerKwh,
            status = request.status,
            waitMins = request.waitMins
        )
    }

    fun updatePort(stationId: String, portId: String, request: UpdatePortRequest): PortResponse = transaction {
        Ports.update({ (Ports.stationId eq stationId) and (Ports.id eq portId) }) { row ->
            request.type?.let { row[Ports.type] = it }
            request.powerKw?.let { row[Ports.powerKw] = it }
            request.pricePerKwh?.let { row[Ports.pricePerKwh] = java.math.BigDecimal.valueOf(it) }
            request.status?.let { row[Ports.status] = it }
            request.waitMins?.let { row[Ports.waitMins] = it }
        }

        val updated = Ports.selectAll()
            .where { (Ports.stationId eq stationId) and (Ports.id eq portId) }
            .singleOrNull() ?: throw IllegalArgumentException("Port not found")

        PortResponse(
            id = updated[Ports.id],
            type = updated[Ports.type],
            powerKw = updated[Ports.powerKw],
            pricePerKwh = updated[Ports.pricePerKwh].toDouble(),
            status = updated[Ports.status],
            waitMins = updated[Ports.waitMins]
        )
    }

    fun deletePort(stationId: String, portId: String): Boolean = transaction {
        Bookings.deleteWhere { (Bookings.stationId eq stationId) and (Bookings.portId eq portId) }
        val count = Ports.deleteWhere { (Ports.stationId eq stationId) and (Ports.id eq portId) }
        count > 0
    }
}
