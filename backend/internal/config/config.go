package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DatabaseURL      string
	JWTSecret        string
	CookieSecure     bool
	FrontendURL      string
	AllowedOrigins   []string
	TelegramBotToken string
	DemoEmail        string
	DemoPassword     string
	AppEnv           string
}

func Load() Config {
	_ = godotenv.Load()

	cfg := Config{
		Port:             getEnv("PORT", "8080"),
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://postgres:postgres@db:5432/tg_calorie?sslmode=disable"),
		JWTSecret:        getEnv("JWT_SECRET", "super-secret-tg-calorie-key"),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:5173"),
		TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
		DemoEmail:        getEnv("DEMO_EMAIL", "demo@tgcalorie.local"),
		DemoPassword:     getEnv("DEMO_PASSWORD", "demo12345"),
		AppEnv:           getEnv("APP_ENV", "development"),
	}
	cfg.CookieSecure = cfg.AppEnv == "production"
	cfg.AllowedOrigins = parseOrigins(getEnv("ALLOWED_ORIGINS", cfg.FrontendURL+",http://localhost:4173,http://localhost:5173"))

	if cfg.DatabaseURL == "" || cfg.JWTSecret == "" {
		log.Fatal("DATABASE_URL and JWT_SECRET are required")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func parseOrigins(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, item := range parts {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}
