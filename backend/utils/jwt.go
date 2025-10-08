package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var SecretKey = []byte("supersecretkey")

func GenerateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 2).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}