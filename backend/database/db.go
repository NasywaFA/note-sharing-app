package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"backend/models"
)

var DB *gorm.DB

func Connect() {
	dsn := "host=postgres user=postgres password=279111 dbname=notesdb port=5432 sslmode=disable"
	var err error

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB.AutoMigrate(&models.User{}, &models.Note{})

	log.Println("Database connected successfully!")
}
