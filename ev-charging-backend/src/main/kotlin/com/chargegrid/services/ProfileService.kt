package com.chargegrid.services

import com.chargegrid.dto.*
import com.chargegrid.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class ProfileService {

    fun getProfile(userId: Long): UserResponse = transaction {
        val user = Users.selectAll().where { Users.id eq userId }.singleOrNull()
            ?: throw IllegalArgumentException("User not found")

        val vehicle = Vehicles.selectAll()
            .where { (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }
            .singleOrNull()

        UserResponse(
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
    }

    fun updateProfile(userId: Long, request: UpdateProfileRequest): UserResponse = transaction {
        request.name?.let { Users.update({ Users.id eq userId }) { row -> row[Users.name] = it } }
        request.email?.let { Users.update({ Users.id eq userId }) { row -> row[Users.email] = it.lowercase() } }
        request.phone?.let { Users.update({ Users.id eq userId }) { row -> row[Users.phone] = it } }

        request.vehicle?.let { vehicleReq ->
            val existing = Vehicles.selectAll()
                .where { (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }
                .singleOrNull()

            if (existing != null) {
                vehicleReq.make?.let { Vehicles.update({ (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }) { row -> row[Vehicles.make] = it } }
                vehicleReq.model?.let { Vehicles.update({ (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }) { row -> row[Vehicles.model] = it } }
                vehicleReq.regNumber?.let { Vehicles.update({ (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }) { row -> row[Vehicles.regNumber] = it } }
                vehicleReq.connectorType?.let { Vehicles.update({ (Vehicles.userId eq userId) and (Vehicles.isPrimary eq true) }) { row -> row[Vehicles.connectorType] = it } }
            } else {
                Vehicles.insert { row ->
                    row[Vehicles.userId] = userId
                    row[Vehicles.make] = vehicleReq.make
                    row[Vehicles.model] = vehicleReq.model
                    row[Vehicles.regNumber] = vehicleReq.regNumber
                    row[Vehicles.connectorType] = vehicleReq.connectorType
                    row[Vehicles.isPrimary] = true
                }
            }
        }

        getProfile(userId)
    }
}
