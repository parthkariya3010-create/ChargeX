package com.chargegrid.config

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

fun Application.configureCORS() {
    intercept(ApplicationCallPipeline.Plugins) {
        val origin = call.request.headers[HttpHeaders.Origin]
        if (origin == null) return@intercept

        call.response.header(HttpHeaders.AccessControlAllowOrigin, origin)
        call.response.header(HttpHeaders.AccessControlAllowCredentials, "true")

        if (call.request.httpMethod == HttpMethod.Options) {
            call.response.header(HttpHeaders.AccessControlAllowMethods, "GET, POST, PUT, DELETE, OPTIONS")
            call.response.header(HttpHeaders.AccessControlAllowHeaders, "Content-Type, Authorization")
            call.response.header(HttpHeaders.AccessControlMaxAge, "86400")
            call.respondText("", status = HttpStatusCode.OK)
            finish()
        }
    }
}
