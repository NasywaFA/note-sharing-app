package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect membuka koneksi ke database Postgres
func Connect() {
	dsn := "host=127.0.0.1 user=postgres password=279111 dbname=notesdb port=5433 sslmode=disable"
	var err error

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully!")
}