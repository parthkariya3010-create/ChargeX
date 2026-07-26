package com.chargegrid.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import com.chargegrid.models.*

fun Application.configureDatabases() {
    val dbUrl = System.getenv("DB_URL") ?: "jdbc:mysql://localhost:3306/chargegrid"
    val dbUser = System.getenv("DB_USER") ?: "root"
    val dbPassword = System.getenv("DB_PASSWORD") ?: "302006"

    val config = HikariConfig().apply {
        jdbcUrl = dbUrl
        driverClassName = "com.mysql.cj.jdbc.Driver"
        username = dbUser
        password = dbPassword
        maximumPoolSize = 10
        isAutoCommit = false
        transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        validate()
    }

    val dataSource = HikariDataSource(config)
    Database.connect(dataSource)

    transaction {
        SchemaUtils.create(
            Users,
            Vehicles,
            Stations,
            StationAmenities,
            Ports,
            Bookings
        )
    }
}
