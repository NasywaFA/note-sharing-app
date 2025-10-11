package main

import (
    "log"
    "backend/database"
    "backend/handlers"
    "backend/middleware"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
    database.Connect()

    app := fiber.New()
    app.Use(logger.New())
    app.Use(cors.New())

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:3000",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE",
    }))
    
    api := app.Group("/api")

    // Public routes
    api.Post("/register", handlers.Register)
    api.Post("/login", handlers.Login)

    notes := api.Group("/notes")
    notes.Use(middleware.AuthMiddleware)
    notes.Get("/", handlers.GetNotes)          // Get all notes
    notes.Get("/:id", handlers.GetNote)        // Get single note
    notes.Post("/", handlers.CreateNote)       // Create note
    notes.Put("/:id", handlers.UpdateNote)     // Update note
    notes.Delete("/:id", handlers.DeleteNote)  // Delete note

    log.Fatal(app.Listen(":8080"))
}
