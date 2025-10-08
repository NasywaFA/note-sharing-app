package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"backend/database"
	"backend/models"
	"backend/routes"
)

func main() {
	database.Connect()
	database.DB.AutoMigrate(&models.User{}, &models.Note{})

	app := fiber.New()
	routes.SetupRoutes(app)

	log.Fatal(app.Listen(":3000"))
}
