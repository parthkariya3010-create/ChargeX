package com.chargegrid.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class CreateBookingRequest(
    val stationId: String,
    val portId: String,
    val date: String,
    val startTime: String,
    val vehicleRegNumber: String
)

@Serializable
data class UpdateProfileRequest(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val vehicle: UpdateVehicleRequest? = null
)

@Serializable
data class UpdateVehicleRequest(
    val make: String? = null,
    val model: String? = null,
    val regNumber: String? = null,
    val connectorType: String? = null
)
