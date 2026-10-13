package com.chargegrid.services

import com.chargegrid.dto.*
import com.chargegrid.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class AdminService {

    fun getStats(): AdminStatsResponse = transaction {
        val totalStations = Stations.selectAll().count()
        val totalPorts = Ports.selectAll().count()
        val totalBookings = Bookings.selectAll().count()
        val upcomingBookings = Bookings.selectAll().where { Bookings.status eq "upcoming" }.count()
        val completedBookings = Bookings.selectAll().where { Bookings.status eq "completed" }.count()
        val cancelledBookings = Bookings.selectAll().where { Bookings.status eq "cancelled" }.count()

        val totalUsers = Users.selectAll().count()
        val totalDrivers = Users.selectAll().where { Users.role eq "DRIVER" }.count()
        val totalHosts = Users.selectAll().where { Users.role eq "HOST" }.count()

        AdminStatsResponse(
            totalStations = totalStations,
            totalPorts = totalPorts,
            totalBookings = totalBookings,
            upcomingBookings = upcomingBookings,
            completedBookings = completedBookings,
            cancelledBookings = cancelledBookings,
            totalUsers = totalUsers,
            totalDrivers = totalDrivers,
            totalHosts = totalHosts
        )
    }

    fun getAllBookings(statusFilter: String? = null): List<BookingResponse> = transaction {
        var query = Bookings.selectAll()
        if (!statusFilter.isNullOrBlank() && statusFilter != "all") {
            query = query.where { Bookings.status eq statusFilter }
        }

        query.orderBy(Bookings.createdAt, SortOrder.DESC)
            .map { row ->
                val station = Stations.selectAll().where { Stations.id eq row[Bookings.stationId] }.singleOrNull()
                val port = Ports.selectAll()
                    .where { (Ports.stationId eq row[Bookings.stationId]) and (Ports.id eq row[Bookings.portId]) }
                    .singleOrNull()

                BookingResponse(
                    id = row[Bookings.id],
                    stationId = row[Bookings.stationId],
                    stationName = station?.get(Stations.name) ?: "Unknown Station",
                    stationAddress = station?.get(Stations.address) ?: "",
                    portId = row[Bookings.portId],
                    portType = port?.get(Ports.type) ?: "Standard",
                    powerKw = port?.get(Ports.powerKw) ?: 0,
                    pricePerKwh = port?.get(Ports.pricePerKwh)?.toDouble() ?: 0.0,
                    date = row[Bookings.date].toString(),
                    startTime = row[Bookings.startTime].toString().substring(0, 5),
                    vehicleRegNumber = row[Bookings.vehicleRegNumber],
                    status = row[Bookings.status],
                    createdAt = row[Bookings.createdAt].toString()
                )
            }
    }

    fun getAllUsers(): List<UserResponse> = transaction {
        Users.selectAll().map { user ->
            val userId = user[Users.id]
            val vehicle = Vehicles.selectAll()
                .where { (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }
                .singleOrNull()

            UserResponse(
                id = userId,
                name = user[Users.name],
                email = user[Users.email],
                phone = user[Users.phone],
                role = user[Users.role],
                vehicle = vehicle?.let { v ->
                    VehicleResponse(
                        make = v[Vehicles.make],
                        model = v[Vehicles.model],
                        regNumber = v[Vehicles.regNumber],
                        connectorType = v[Vehicles.connectorType]
                    )
                }
            )
        }
    }

    fun updateBookingStatus(bookingId: String, status: String): Boolean = transaction {
        val updated = Bookings.update({ Bookings.id eq bookingId }) { row ->
            row[Bookings.status] = status
        }
        updated > 0
    }
}

