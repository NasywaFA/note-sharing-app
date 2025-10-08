package handlers

import (
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"backend/database"
	"backend/models"
	"backend/utils"
)

func Register(c *fiber.Ctx) error {
	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	user := models.User{Username: input.Username, Password: string(hashed)}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	database.DB.First(&user, "username = ?", input.Username)
	if user.ID == 0 {
		return c.Status(401).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, _ := utils.GenerateToken(user.ID)
	return c.JSON(fiber.Map{"token": token})
}
