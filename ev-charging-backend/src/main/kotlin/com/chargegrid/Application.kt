package com.chargegrid

import com.chargegrid.config.*
import com.chargegrid.routes.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = System.getenv("PORT")?.toInt() ?: 8081) {
        configureSerialization()
        configureCORS()
        configureSecurity()
        configureDatabases()
        configureRouting()
    }.start(wait = true)
}

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            ignoreUnknownKeys = true
            isLenient = true
        })
    }
}
