package handlers

import (
	"fmt"
	"os"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	body := c.Body()
	fmt.Printf("Raw Body: %s\n", string(body))
	fmt.Printf("Content-Type: %s\n", c.Get("Content-Type"))

	var input models.User

	if err := c.BodyParser(&input); err != nil {
		fmt.Printf("Parse Error: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	fmt.Printf("Parsed Input - Username: %s, Password: %s\n", input.Username, input.Password)

	if len(input.Username) < 3 {
		return c.Status(400).JSON(fiber.Map{"error": "Username min 3 characters"})
	}
	if len(input.Password) < 6 {
		return c.Status(400).JSON(fiber.Map{"error": "Password min 6 characters"})
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		Username: input.Username,
		Password: string(hashed),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	if err := database.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-key" // fallback
	}

	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}
