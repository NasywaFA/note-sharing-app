package middleware

import (
    "os"
    "strings"

    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(c *fiber.Ctx) error {
    // Get token from header
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
    }

    // Remove "Bearer " prefix
    tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

    // Parse token
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            secret = "fallback-secret" // fallback
        }
        return []byte(secret), nil
    })

    if err != nil || !token.Valid {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
    }

    // Extract user_id from token
    claims := token.Claims.(jwt.MapClaims)
    userID := uint(claims["user_id"].(float64))

    // Store user_id in context
    c.Locals("user_id", userID)

    return c.Next()
}