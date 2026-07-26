package com.chargegrid.dto

import kotlinx.serialization.Serializable

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserResponse
)

@Serializable
data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String? = null,
    val vehicle: VehicleResponse? = null
)

@Serializable
data class VehicleResponse(
    val make: String? = null,
    val model: String? = null,
    val regNumber: String? = null,
    val connectorType: String? = null
)

@Serializable
data class StationResponse(
    val id: String,
    val name: String,
    val address: String,
    val city: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val distanceKm: Double? = null,
    val rating: Double? = null,
    val status: String,
    val waitMins: Int = 0,
    val amenities: List<String> = emptyList(),
    val ports: List<PortResponse> = emptyList()
)

@Serializable
data class PortResponse(
    val id: String,
    val type: String,
    val powerKw: Int,
    val pricePerKwh: Double,
    val status: String,
    val waitMins: Int = 0
)

@Serializable
data class SlotResponse(
    val startTime: String,
    val available: Boolean
)

@Serializable
data class BookingResponse(
    val id: String,
    val stationId: String,
    val stationName: String,
    val stationAddress: String,
    val portId: String,
    val portType: String,
    val powerKw: Int,
    val pricePerKwh: Double,
    val date: String,
    val startTime: String,
    val vehicleRegNumber: String? = null,
    val status: String,
    val createdAt: String? = null
)

@Serializable
data class CancelResponse(
    val ok: Boolean
)

@Serializable
data class SuccessResponse(
    val message: String
)

@Serializable
data class ErrorResponse(
    val error: String
)
