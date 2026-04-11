package main

import (
	"log"
	"time"

	"kawaii-calorie-app/backend/internal/config"
	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/routes"
	"kawaii-calorie-app/backend/internal/seed"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	cfg := config.Load()

	var (
		db  *gorm.DB
		err error
	)
	for attempt := 1; attempt <= 10; attempt++ {
		db, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err == nil {
			break
		}
		log.Printf("database connection attempt %d failed: %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Profile{},
		&models.FoodEntry{},
		&models.FavoriteFood{},
		&models.MealTemplate{},
		&models.MealItem{},
		&models.WaterLog{},
		&models.StepLog{},
		&models.WeightLog{},
	); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	if err := db.Model(&models.User{}).Where("telegram_id = ?", 0).Update("telegram_id", nil).Error; err != nil {
		log.Fatalf("telegram_id cleanup failed: %v", err)
	}

	if err := seed.Run(db); err != nil {
		log.Fatalf("seed failed: %v", err)
	}

	r := routes.SetupRouter(cfg, db)
	log.Printf("server listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
