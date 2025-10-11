package models

import "gorm.io/gorm"

type Note struct {
    gorm.Model
    Title    string `gorm:"not null" json:"title"`
    Content  string `gorm:"type:text" json:"content"`
    ImageURL string `gorm:"type:text" json:"image_url"`
    UserID   uint   `gorm:"not null" json:"user_id"`
    User     User   `gorm:"foreignKey:UserID" json:"-"`
}