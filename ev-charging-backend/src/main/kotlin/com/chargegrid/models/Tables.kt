package com.chargegrid.models

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.*
import java.time.LocalDateTime

object Users : Table("users") {
    val id = long("id").autoIncrement()
    val name = varchar("name", 100)
    val email = varchar("email", 255).uniqueIndex()
    val phone = varchar("phone", 20).nullable()
    val passwordHash = varchar("password_hash", 255)
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").clientDefault { LocalDateTime.now() }

    override val primaryKey = PrimaryKey(id)
}

object Vehicles : Table("vehicles") {
    val id = long("id").autoIncrement()
    val userId = long("user_id").references(Users.id)
    val make = varchar("make", 50).nullable()
    val model = varchar("model", 50).nullable()
    val regNumber = varchar("reg_number", 20).nullable()
    val connectorType = varchar("connector_type", 20).nullable()
    val isPrimary = bool("is_primary").default(false)

    override val primaryKey = PrimaryKey(id)
}

object Stations : Table("stations") {
    val id = varchar("id", 20)
    val name = varchar("name", 200)
    val address = text("address")
    val city = varchar("city", 100)
    val latitude = decimal("latitude", 10, 7).nullable()
    val longitude = decimal("longitude", 10, 7).nullable()
    val distanceKm = decimal("distance_km", 5, 2).nullable()
    val rating = decimal("rating", 2, 1).nullable()
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }

    override val primaryKey = PrimaryKey(id)
}

object StationAmenities : Table("station_amenities") {
    val id = long("id").autoIncrement()
    val stationId = varchar("station_id", 20).references(Stations.id)
    val amenity = varchar("amenity", 50)

    override val primaryKey = PrimaryKey(id)
}

object Ports : Table("ports") {
    val id = varchar("id", 20)
    val stationId = varchar("station_id", 20).references(Stations.id)
    val type = varchar("type", 20)
    val powerKw = integer("power_kw")
    val pricePerKwh = decimal("price_per_kwh", 5, 2)
    val status = varchar("status", 20).default("available")
    val waitMins = integer("wait_mins").default(0)

    override val primaryKey = PrimaryKey(id, stationId)
}

object Bookings : Table("bookings") {
    val id = varchar("id", 30)
    val userId = long("user_id").references(Users.id)
    val stationId = varchar("station_id", 20).references(Stations.id)
    val portId = varchar("port_id", 20)
    val date = date("date")
    val startTime = time("start_time")
    val vehicleRegNumber = varchar("vehicle_reg_number", 20).nullable()
    val status = varchar("status", 20).default("upcoming")
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").clientDefault { LocalDateTime.now() }

    override val primaryKey = PrimaryKey(id)
}
