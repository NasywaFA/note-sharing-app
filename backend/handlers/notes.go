package handlers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Logger utility
func logAction(action, message string, data ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	fmt.Printf("[%s] %s [%s] %s", timestamp, action, message)
	if len(data) > 0 {
		fmt.Printf(" %v", data)
	}
	fmt.Println()
}

// Get all notes (for logged in user)
func GetNotes(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	logAction("READ", fmt.Sprintf("User ID %d fetching all notes", userID))

	var notes []models.Note
	if err := database.DB.Preload("User").Where("user_id = ?", userID).Order("created_at DESC").Find(&notes).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Failed to fetch notes for user ID %d", userID), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch notes"})
	}

	logAction("READ", fmt.Sprintf("Successfully fetched %d notes for user ID %d", len(notes), userID))
	return c.JSON(notes)
}

// Get all public notes (no auth required)
func GetPublicNotes(c *fiber.Ctx) error {
	logAction("READ", "Fetching all public notes")

	var notes []models.Note

	if err := database.DB.Preload("User").Where("is_public = ?", true).Order("created_at DESC").Find(&notes).Error; err != nil {
		logAction("ERROR", "Failed to fetch public notes", err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch public notes"})
	}

	logAction("READ", fmt.Sprintf("Successfully fetched %d public notes", len(notes)))
	return c.JSON(notes)
}

// Get single public note by ID (no auth required)
func GetPublicNote(c *fiber.Ctx) error {
	noteID := c.Params("id")

	logAction("READ", fmt.Sprintf("Fetching public note ID: %s", noteID))

	var note models.Note
	if err := database.DB.Preload("User").Where("id = ? AND is_public = ?", noteID, true).First(&note).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Public note ID %s not found", noteID))
		return c.Status(404).JSON(fiber.Map{"error": "Note not found or not public"})
	}

	logAction("READ", fmt.Sprintf("Successfully fetched public note: \"%s\" (ID: %s)", note.Title, noteID))
	return c.JSON(note)
}

// Get single note by ID
func GetNote(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	noteID := c.Params("id")

	logAction("READ", fmt.Sprintf("User ID %d fetching note ID: %s", userID, noteID))

	var note models.Note
	if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Note ID %s not found for user ID %d", noteID, userID))
		return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
	}

	logAction("READ", fmt.Sprintf("Successfully fetched note: \"%s\" (ID: %s)", note.Title, noteID))
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
		logAction("ERROR", fmt.Sprintf("Invalid input from user ID %d", userID), err.Error())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	hasImage := input.ImageURL != ""
	logAction("CREATE", fmt.Sprintf("User ID %d creating note: \"%s\"%s", userID, input.Title, func() string {
		if hasImage {
			return " with image"
		}
		return ""
	}()))

	if hasImage {
		logAction("UPLOAD", fmt.Sprintf("Image upload detected for note: \"%s\"", input.Title))
	}

	note := models.Note{
		Title:    input.Title,
		Content:  input.Content,
		ImageURL: input.ImageURL,
		IsPublic: input.IsPublic,
		UserID:   userID,
	}

	if err := database.DB.Create(&note).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Failed to create note for user ID %d", userID), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create note"})
	}

	database.DB.Preload("User").First(&note, note.ID)

	if hasImage {
		logAction("UPLOAD", fmt.Sprintf("Image uploaded successfully for note ID %d", note.ID))
	}

	logAction("CREATE", fmt.Sprintf("Note created successfully: \"%s\" (ID: %d) by user ID %d", note.Title, note.ID, userID))
	return c.Status(201).JSON(note)
}

// Update note
func UpdateNote(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	noteID := c.Params("id")

	logAction("UPDATE", fmt.Sprintf("User ID %d updating note ID: %s", userID, noteID))

	var note models.Note
	if err := database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Note ID %s not found for user ID %d", noteID, userID))
		return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
	}

	oldTitle := note.Title

	var input struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		ImageURL string `json:"image_url"`
		IsPublic bool   `json:"is_public"`
	}

	if err := c.BodyParser(&input); err != nil {
		logAction("ERROR", fmt.Sprintf("Invalid input for note ID %s", noteID), err.Error())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	note.Title = input.Title
	note.Content = input.Content
	note.ImageURL = input.ImageURL
	note.IsPublic = input.IsPublic

	if err := database.DB.Save(&note).Error; err != nil {
		logAction("ERROR", fmt.Sprintf("Failed to update note ID %s", noteID), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update note"})
	}

	database.DB.Preload("User").First(&note, note.ID)

	logAction("UPDATE", fmt.Sprintf("Note updated successfully: \"%s\" -> \"%s\" (ID: %s)", oldTitle, note.Title, noteID))
	return c.JSON(note)
}

// Delete note
func DeleteNote(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	noteID := c.Params("id")

	logAction("DELETE", fmt.Sprintf("User ID %d deleting note ID: %s", userID, noteID))

	// Fetch note title before deleting (for logging)
	var note models.Note
	database.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note)
	noteTitle := note.Title

	result := database.DB.Where("id = ? AND user_id = ?", noteID, userID).Delete(&models.Note{})
	if result.RowsAffected == 0 {
		logAction("ERROR", fmt.Sprintf("Note ID %s not found or unauthorized for user ID %d", noteID, userID))
		return c.Status(404).JSON(fiber.Map{"error": "Note not found"})
	}
	logAction("DELETE", fmt.Sprintf("Note deleted successfully: \"%s\" (ID: %s) by user ID %d", noteTitle, noteID, userID))
	return c.JSON(fiber.Map{"message": "Note deleted successfully"})
}
