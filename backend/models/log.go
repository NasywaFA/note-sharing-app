package models

import (
	"os"
	"time"
)

func WriteLog(message string) {
	file, err := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return
	}
	defer file.Close()

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	file.WriteString(timestamp + " - " + message + "\n")
}