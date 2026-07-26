package com.chargegrid.services

import com.chargegrid.dto.*
import com.chargegrid.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDate
import java.time.LocalTime

class BookingService {

    fun createBooking(userId: Long, request: CreateBookingRequest): BookingResponse = transaction {
        val station = Stations.selectAll().where { Stations.id eq request.stationId }.singleOrNull()
            ?: throw IllegalArgumentException("Station not found")

        val port = Ports.selectAll()
            .where { (Ports.stationId eq request.stationId) and (Ports.id eq request.portId) }
            .singleOrNull()
            ?: throw IllegalArgumentException("Port not found")

        val bookingDate = LocalDate.parse(request.date)
        val bookingTime = LocalTime.parse(request.startTime)

        val conflict = Bookings.selectAll()
            .where {
                (Bookings.stationId eq request.stationId) and
                (Bookings.portId eq request.portId) and
                (Bookings.date eq bookingDate) and
                (Bookings.startTime eq bookingTime) and
                (Bookings.status neq "cancelled")
            }
            .singleOrNull()

        if (conflict != null) {
            throw IllegalArgumentException("This slot is already booked")
        }

        val bookingId = "bkg_${System.currentTimeMillis()}"
        Bookings.insert { row ->
            row[Bookings.id] = bookingId
            row[Bookings.userId] = userId
            row[Bookings.stationId] = request.stationId
            row[Bookings.portId] = request.portId
            row[Bookings.date] = bookingDate
            row[Bookings.startTime] = bookingTime
            row[Bookings.vehicleRegNumber] = request.vehicleRegNumber
            row[Bookings.status] = "upcoming"
        }

        BookingResponse(
            id = bookingId,
            stationId = request.stationId,
            stationName = station[Stations.name],
            stationAddress = station[Stations.address],
            portId = request.portId,
            portType = port[Ports.type],
            powerKw = port[Ports.powerKw],
            pricePerKwh = port[Ports.pricePerKwh].toDouble(),
            date = request.date,
            startTime = request.startTime,
            vehicleRegNumber = request.vehicleRegNumber,
            status = "upcoming",
            createdAt = java.time.LocalDateTime.now().toString()
        )
    }

    fun getMyBookings(userId: Long): List<BookingResponse> = transaction {
        Bookings.selectAll()
            .where { Bookings.userId eq userId }
            .orderBy(Bookings.createdAt, SortOrder.DESC)
            .map { row ->
                val station = Stations.selectAll().where { Stations.id eq row[Bookings.stationId] }.single()
                val port = Ports.selectAll()
                    .where { (Ports.stationId eq row[Bookings.stationId]) and (Ports.id eq row[Bookings.portId]) }
                    .single()

                BookingResponse(
                    id = row[Bookings.id],
                    stationId = row[Bookings.stationId],
                    stationName = station[Stations.name],
                    stationAddress = station[Stations.address],
                    portId = row[Bookings.portId],
                    portType = port[Ports.type],
                    powerKw = port[Ports.powerKw],
                    pricePerKwh = port[Ports.pricePerKwh].toDouble(),
                    date = row[Bookings.date].toString(),
                    startTime = row[Bookings.startTime].toString().substring(0, 5),
                    vehicleRegNumber = row[Bookings.vehicleRegNumber],
                    status = row[Bookings.status],
                    createdAt = row[Bookings.createdAt].toString()
                )
            }
    }

    fun cancelBooking(userId: Long, bookingId: String): Boolean = transaction {
        val booking = Bookings.selectAll()
            .where { (Bookings.id eq bookingId) and (Bookings.userId eq userId) }
            .singleOrNull() ?: return@transaction false

        Bookings.update({ Bookings.id eq bookingId }) {
            it[Bookings.status] = "cancelled"
        }

        true
    }
}
