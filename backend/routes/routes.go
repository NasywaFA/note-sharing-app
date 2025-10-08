package routes

import (
	"github.com/gofiber/fiber/v2"
	"backend/handlers"
	"backend/middleware"
)

func SetupRoutes(app *fiber.App) {
	app.Use(middleware.LoggerMiddleware)

	api := app.Group("/api")

	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)
	api.Get("/notes", handlers.GetNotes)
	api.Post("/notes", handlers.CreateNote)
	api.Delete("/notes/:id", handlers.DeleteNote)
}