package main

import (
	"backend/database"
	"backend/handlers"
	"backend/middleware"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Connect to DB
	database.Connect()

	app := fiber.New()

	// Logger middleware
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${method} ${path} - ${status}\n",
		TimeFormat: "02-Jan-2006 15:04:05",
		TimeZone:   "Local",
	}))

	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	// Handle OPTIONS preflight
	app.Options("*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	// API group
	api := app.Group("/api")

	// Public routes
	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	api.Get("/public/notes", handlers.GetPublicNotes)
	api.Get("/public/notes/:id", handlers.GetPublicNote)

	// Notes routes (protected)
	notes := api.Group("/notes")
	notes.Use(middleware.AuthMiddleware)
	notes.Get("/", handlers.GetNotes)         // Get all notes
	notes.Get("/:id", handlers.GetNote)       // Get single note
	notes.Post("/", handlers.CreateNote)      // Create note
	notes.Put("/:id", handlers.UpdateNote)    // Update note
	notes.Delete("/:id", handlers.DeleteNote) // Delete note

	log.Println("Server running on http://localhost:8080")

	// Start server
	log.Fatal(app.Listen(":8080"))
}