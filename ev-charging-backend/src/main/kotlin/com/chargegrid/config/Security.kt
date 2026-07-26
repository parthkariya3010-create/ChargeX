package com.chargegrid.config

import at.favre.lib.crypto.bcrypt.BCrypt
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import java.util.*

object SecurityConfig {
    private const val SECRET = "chargegrid-secret-key-change-in-production-min-256-bits!!"
    private const val ISSUER = "chargegrid"
    private const val AUDIENCE = "chargegrid-users"
    private const val EXPIRES_HOURS = 24L

    private val algorithm = Algorithm.HMAC256(SECRET)

    fun hashPassword(password: String): String =
        BCrypt.withDefaults().hashToString(12, password.toCharArray())

    fun verifyPassword(password: String, hash: String): Boolean =
        BCrypt.verifyer().verify(password.toCharArray(), hash).verified

    fun generateToken(userId: Long, email: String): String =
        JWT.create()
            .withIssuer(ISSUER)
            .withAudience(AUDIENCE)
            .withSubject(userId.toString())
            .withClaim("email", email)
            .withIssuedAt(Date())
            .withExpiresAt(Date(System.currentTimeMillis() + EXPIRES_HOURS * 3600 * 1000))
            .sign(algorithm)
}

fun Application.configureSecurity() {
    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                JWT.require(Algorithm.HMAC256("chargegrid-secret-key-change-in-production-min-256-bits!!"))
                    .withIssuer("chargegrid")
                    .withAudience("chargegrid-users")
                    .build()
            )
            validate { credential ->
                val userId = credential.payload.subject?.toLongOrNull()
                if (userId != null) {
                    JWTPrincipal(credential.payload)
                } else null
            }
        }
    }
}
