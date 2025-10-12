package handlers

import (
    "backend/database"
    "backend/models"

    "github.com/gofiber/fiber/v2"
)

// Get all notes (for user to login)
func GetNotes(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)

    var notes []models.Note
    if err := database.DB.Preload("User").Where("user_id = ?", userID).Order("created_at DESC").Find(&notes).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch notes"})
    }

    return c.JSON(notes)
}

// Get all public notes (no auth required)
func GetPublicNotes(c *fiber.Ctx) error {
    var notes []models.Note
    
    // Get all public notes with user info, ordered by latest
    if err := database.DB.Preload("User").Where("is_public = ?", true).Order("created_at DESC").Find(&notes).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch public notes"})
    }

    return c.JSON(notes)
}

// Get single public note by ID (no auth required)
func GetPublicNote(c *fiber.Ctx) error {
    noteID := c.Params("id")

    var note models.Note
    if err := database.DB.Preload("User").Where("id = ? AND is_public = ?", noteID, true).First(&note).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Note not found or not public"})
    }

    return c.JSON(note)
}

// Get single note by ID
func GetNote(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    noteID := c.Params("id")

    var note models.Note
    if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
    }

    return c.JSON(note)
}

// Create note
func CreateNote(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)

    var input struct {
        Title    string `json:"title"`
        Content  string `json:"content"`
        ImageURL string `json:"image_url"`
        IsPublic bool   `json:"is_public"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    note := models.Note{
        Title:    input.Title,
        Content:  input.Content,
        ImageURL: input.ImageURL,
        IsPublic: input.IsPublic,
        UserID:   userID,
    }

    if err := database.DB.Create(&note).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to create note"})
    }

    database.DB.Preload("User").First(&note, note.ID)

    return c.Status(201).JSON(note)
}

// Update note
func UpdateNote(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    noteID := c.Params("id")

    var note models.Note
    if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
    }

    var input struct {
        Title    string `json:"title"`
        Content  string `json:"content"`
        ImageURL string `json:"image_url"`
        IsPublic bool   `json:"is_public"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    note.Title = input.Title
    note.Content = input.Content
    note.ImageURL = input.ImageURL
    note.IsPublic = input.IsPublic

    if err := database.DB.Save(&note).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update note"})
    }

    database.DB.Preload("User").First(&note, note.ID)

    return c.JSON(note)
}

// Delete note
func DeleteNote(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uint)
    noteID := c.Params("id")

    result := database.DB.Where("id = ? AND user_id = ?", noteID, userID).Delete(&models.Note{})
    if result.RowsAffected == 0 {
        return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
    }

    return c.JSON(fiber.Map{"message": "Note deleted successfully"})
}