package middleware

import (
	"github.com/gofiber/fiber/v2"
	"backend/models"
)

func LoggerMiddleware(c *fiber.Ctx) error {
	method := c.Method()
	path := c.Path()
	models.WriteLog(method + " " + path)
	return c.Next()
}