package handlers

import (
	"fmt"
	"os"
	"strings"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Logger utility (jika belum ada di note.go, copas ini)
func logAuth(action, message string, data ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	fmt.Printf("[%s] %s [%s] %s", timestamp, action, message)
	if len(data) > 0 {
		fmt.Printf(" %v", data)
	}
	fmt.Println()
}

// Register handler
func Register(c *fiber.Ctx) error {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		logAuth("ERROR", "Invalid registration input", err.Error())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	logAuth("REGISTER", fmt.Sprintf("Registration attempt for username: %s, email: %s", input.Username, input.Email))

	// Validation
	if len(input.Username) < 3 {
		logAuth("ERROR", fmt.Sprintf("Username too short: %s", input.Username))
		return c.Status(400).JSON(fiber.Map{"error": "Username must be at least 3 characters"})
	}
	if len(input.Password) < 6 {
		logAuth("ERROR", fmt.Sprintf("Password too short for user: %s", input.Username))
		return c.Status(400).JSON(fiber.Map{"error": "Password must be at least 6 characters"})
	}
	if !strings.Contains(input.Email, "@") || !strings.Contains(input.Email, ".") {
		logAuth("ERROR", fmt.Sprintf("Invalid email format: %s", input.Email))
		return c.Status(400).JSON(fiber.Map{"error": "Invalid email format"})
	}

	// Cek duplicate username
	var existingUser models.User
	if err := database.DB.Where("username = ?", input.Username).First(&existingUser).Error; err == nil {
		logAuth("ERROR", fmt.Sprintf("Username already taken: %s", input.Username))
		return c.Status(409).JSON(fiber.Map{"error": "Username already taken"})
	}

	// Cek duplicate email
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		logAuth("ERROR", fmt.Sprintf("Email already registered: %s", input.Email))
		return c.Status(409).JSON(fiber.Map{"error": "Email already registered"})
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		logAuth("ERROR", fmt.Sprintf("Failed to hash password for user: %s", input.Username), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashed),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		logAuth("ERROR", fmt.Sprintf("Failed to create user: %s", input.Username), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	logAuth("SUCCESS", fmt.Sprintf("User registered successfully: %s (ID: %d, Email: %s)", user.Username, user.ID, user.Email))
	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

// Login handler
func Login(c *fiber.Ctx) error {
	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		logAuth("ERROR", "Invalid login input", err.Error())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	logAuth("LOGIN", fmt.Sprintf("Login attempt for: %s", input.Login))

	var user models.User
	err := database.DB.Where("username = ? OR email = ?", input.Login, input.Login).First(&user).Error
	if err != nil {
		logAuth("ERROR", fmt.Sprintf("User not found: %s", input.Login))
		return c.Status(401).JSON(fiber.Map{"error": "User not found"})
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		logAuth("ERROR", fmt.Sprintf("Incorrect password for user: %s (ID: %d)", user.Username, user.ID))
		return c.Status(401).JSON(fiber.Map{"error": "Incorrect password"})
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-key"
	}

	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"email":    user.Email,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		logAuth("ERROR", fmt.Sprintf("Failed to generate token for user: %s", user.Username), err.Error())
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	logAuth("SUCCESS", fmt.Sprintf("Login successful: %s (ID: %d, Email: %s)", user.Username, user.ID, user.Email))

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}
