package com.chargegrid.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null,
    val role: String? = "DRIVER" // ADMIN, HOST, DRIVER
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

@Serializable
data class CreateStationRequest(
    val id: String? = null,
    val name: String,
    val address: String,
    val city: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val rating: Double? = 4.5,
    val amenities: List<String> = emptyList(),
    val ports: List<CreatePortRequest> = emptyList()
)

@Serializable
data class UpdateStationRequest(
    val name: String? = null,
    val address: String? = null,
    val city: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val rating: Double? = null,
    val amenities: List<String>? = null
)

@Serializable
data class CreatePortRequest(
    val id: String,
    val type: String,
    val powerKw: Int,
    val pricePerKwh: Double,
    val status: String = "available",
    val waitMins: Int = 0
)

@Serializable
data class UpdatePortRequest(
    val type: String? = null,
    val powerKw: Int? = null,
    val pricePerKwh: Double? = null,
    val status: String? = null,
    val waitMins: Int? = null
)

@Serializable
data class UpdateBookingStatusRequest(
    val status: String
)
