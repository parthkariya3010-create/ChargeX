package com.chargegrid.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.*
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
        SchemaUtils.createMissingTablesAndColumns(
            Users,
            Vehicles,
            Stations,
            StationAmenities,
            Ports,
            Bookings
        )

        // Migration safeguards for existing legacy tables
        try {
            exec("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'DRIVER'")
        } catch (_: Exception) {
            // Column may already exist
        }

        try {
            exec("ALTER TABLE stations ADD COLUMN host_id BIGINT NULL")
        } catch (_: Exception) {
            // Column may already exist
        }

        // Auto-seed default demo users if not present
        if (Users.selectAll().where { Users.email eq "admin@chargex.in" }.empty()) {
            Users.insert { row ->
                row[Users.name] = "CHARGEX Administrator"
                row[Users.email] = "admin@chargex.in"
                row[Users.phone] = "+91 98765 43210"
                row[Users.passwordHash] = SecurityConfig.hashPassword("admin123")
                row[Users.role] = "ADMIN"
            }
        }
        if (Users.selectAll().where { Users.email eq "host@chargex.in" }.empty()) {
            Users.insert { row ->
                row[Users.name] = "Adani Power Hub Host"
                row[Users.email] = "host@chargex.in"
                row[Users.phone] = "+91 98765 43211"
                row[Users.passwordHash] = SecurityConfig.hashPassword("host123")
                row[Users.role] = "HOST"
            }
        }
        if (Users.selectAll().where { Users.email eq "driver@chargex.in" }.empty()) {
            Users.insert { row ->
                row[Users.name] = "Rahul Sharma"
                row[Users.email] = "driver@chargex.in"
                row[Users.phone] = "+91 98765 43212"
                row[Users.passwordHash] = SecurityConfig.hashPassword("driver123")
                row[Users.role] = "DRIVER"
            }
        }
    }
}
