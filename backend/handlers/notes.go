package handlers

import (
	"github.com/gofiber/fiber/v2"
	"backend/database"
	"backend/models"
)

func GetNotes(c *fiber.Ctx) error {
	var notes []models.Note
	database.DB.Find(&notes)
	return c.JSON(notes)
}

func CreateNote(c *fiber.Ctx) error {
	var note models.Note
	if err := c.BodyParser(&note); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	database.DB.Create(&note)
	return c.JSON(note)
}

func DeleteNote(c *fiber.Ctx) error {
	id := c.Params("id")
	database.DB.Delete(&models.Note{}, id)
	return c.JSON(fiber.Map{"message": "Note deleted"})
}
