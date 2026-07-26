package com.chargegrid.services

import com.chargegrid.config.SecurityConfig
import com.chargegrid.dto.*
import com.chargegrid.models.Users
import com.chargegrid.models.Vehicles
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class AuthService {

    fun signup(request: SignupRequest): AuthResponse = transaction {
        val existing = Users.selectAll().where { Users.email eq request.email }.singleOrNull()
        if (existing != null) {
            throw IllegalArgumentException("Email already registered")
        }

        Users.insert { row ->
            row[Users.name] = request.name
            row[Users.email] = request.email.lowercase()
            row[Users.phone] = request.phone
            row[Users.passwordHash] = SecurityConfig.hashPassword(request.password)
        }
        val userId = Users.selectAll().where { Users.email eq request.email.lowercase() }.single()[Users.id]

        val token = SecurityConfig.generateToken(userId, request.email.lowercase())

        AuthResponse(
            token = token,
            user = UserResponse(
                id = userId,
                name = request.name,
                email = request.email.lowercase(),
                phone = request.phone
            )
        )
    }

    fun login(request: LoginRequest): AuthResponse = transaction {
        val user = Users.selectAll().where { Users.email eq request.email.lowercase() }.singleOrNull()
            ?: throw IllegalArgumentException("Invalid email or password")

        if (!SecurityConfig.verifyPassword(request.password, user[Users.passwordHash])) {
            throw IllegalArgumentException("Invalid email or password")
        }

        val userId = user[Users.id]
        val token = SecurityConfig.generateToken(userId, request.email.lowercase())

        val vehicle = Vehicles.selectAll()
            .where { (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }
            .singleOrNull()

        AuthResponse(
            token = token,
            user = UserResponse(
                id = userId,
                name = user[Users.name],
                email = user[Users.email],
                phone = user[Users.phone],
                vehicle = vehicle?.let { v ->
                    VehicleResponse(
                        make = v[Vehicles.make],
                        model = v[Vehicles.model],
                        regNumber = v[Vehicles.regNumber],
                        connectorType = v[Vehicles.connectorType]
                    )
                }
            )
        )
    }
}
