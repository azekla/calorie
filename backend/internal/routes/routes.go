package routes

import (
	"kawaii-calorie-app/backend/internal/config"
	"kawaii-calorie-app/backend/internal/handlers"
	"kawaii-calorie-app/backend/internal/middleware"
	"kawaii-calorie-app/backend/internal/repository"
	"kawaii-calorie-app/backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(cfg config.Config, db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	repo := repository.New(db)
	authService := services.NewAuthService(repo)
	profileService := services.NewProfileService(repo)
	diaryService := services.NewDiaryService(repo)
	statsService := services.NewStatsService(repo, diaryService, profileService)

	authHandler := handlers.NewAuthHandler(authService, cfg)
	profileHandler := handlers.NewProfileHandler(profileService)
	diaryHandler := handlers.NewDiaryHandler(diaryService)
	statsHandler := handlers.NewStatsHandler(statsService)

	r.GET("/health", statsHandler.Health)
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/telegram", authHandler.Telegram)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.AuthRequired(cfg), authHandler.Me)
		}

		protected := api.Group("")
		protected.Use(middleware.AuthRequired(cfg))
		{
			protected.GET("/profile", profileHandler.Get)
			protected.PUT("/profile", profileHandler.Update)
			protected.PUT("/profile/goals", profileHandler.UpdateGoals)

			protected.GET("/entries", diaryHandler.GetEntries)
			protected.POST("/entries", diaryHandler.CreateEntry)
			protected.PUT("/entries/:id", diaryHandler.UpdateEntry)
			protected.DELETE("/entries/:id", diaryHandler.DeleteEntry)

			protected.GET("/favorites", diaryHandler.GetFavorites)
			protected.POST("/favorites", diaryHandler.CreateFavorite)
			protected.DELETE("/favorites/:id", diaryHandler.DeleteFavorite)

			protected.GET("/meals", diaryHandler.GetMeals)
			protected.POST("/meals", diaryHandler.CreateMeal)
			protected.PUT("/meals/:id", diaryHandler.UpdateMeal)
			protected.DELETE("/meals/:id", diaryHandler.DeleteMeal)
			protected.POST("/meals/:id/add-to-day", diaryHandler.AddMealToDay)

			protected.GET("/water", diaryHandler.GetWater)
			protected.POST("/water", diaryHandler.AddWater)

			protected.GET("/steps", diaryHandler.GetSteps)
			protected.POST("/steps", diaryHandler.SaveSteps)

			protected.GET("/weight", diaryHandler.GetWeight)
			protected.POST("/weight", diaryHandler.AddWeight)

			protected.GET("/stats/today", statsHandler.Today)
			protected.GET("/stats/history", statsHandler.History)
			protected.GET("/stats/summary", statsHandler.Summary)
			protected.POST("/stats/can-i-eat", statsHandler.CanIEat)

			protected.GET("/challenges/today", statsHandler.Challenge)
			protected.GET("/streak", statsHandler.Streak)
		}
	}

	return r
}
