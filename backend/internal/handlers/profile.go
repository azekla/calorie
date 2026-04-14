package handlers

import (
	"net/http"

	"kawaii-calorie-app/backend/internal/middleware"
	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/services"
	"kawaii-calorie-app/backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	service *services.ProfileService
}

func NewProfileHandler(service *services.ProfileService) *ProfileHandler {
	return &ProfileHandler{service: service}
}

func (h *ProfileHandler) Get(c *gin.Context) {
	profile, user, err := h.service.Get(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Профиль не найден")
		return
	}
	recommendedCalories := utils.CalculateRecommendedCalories(profile.Gender, profile.WeightKG, profile.HeightCM, profile.Age, profile.ActivityLevel, profile.GoalType)
	utils.JSON(c, http.StatusOK, gin.H{
		"user":                user,
		"profile":             profile,
		"recommendedCalories": recommendedCalories,
		"goalOptions": []gin.H{
			{"value": "lose", "label": "Похудение"},
			{"value": "maintain", "label": "Поддержание"},
			{"value": "gain", "label": "Набор массы"},
		},
		"activityOptions": []gin.H{
			{"value": "низкая", "label": "Низкая активность"},
			{"value": "умеренная", "label": "Умеренная активность"},
			{"value": "высокая", "label": "Высокая активность"},
		},
	})
}

func (h *ProfileHandler) Update(c *gin.Context) {
	var body struct {
		User struct {
			Name  string `json:"name"`
			Theme string `json:"theme"`
		} `json:"user"`
		Profile struct {
			Gender                   string  `json:"gender"`
			HeightCM                 int     `json:"heightCm"`
			WeightKG                 float64 `json:"weightKg"`
			Age                      int     `json:"age"`
			ActivityLevel            string  `json:"activityLevel"`
			GoalType                 string  `json:"goalType"`
			DailyCalorieGoal         int     `json:"dailyCalorieGoal"`
			ManualCalorieGoalEnabled bool    `json:"manualCalorieGoalEnabled"`
			WaterGoalML              int     `json:"waterGoalMl"`
			StepsGoal                int     `json:"stepsGoal"`
		} `json:"profile"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные профиля")
		return
	}
	user := models.User{Name: body.User.Name, Theme: body.User.Theme}
	profile := models.Profile{
		Gender:                   body.Profile.Gender,
		HeightCM:                 body.Profile.HeightCM,
		WeightKG:                 body.Profile.WeightKG,
		Age:                      body.Profile.Age,
		ActivityLevel:            body.Profile.ActivityLevel,
		GoalType:                 body.Profile.GoalType,
		DailyCalorieGoal:         body.Profile.DailyCalorieGoal,
		ManualCalorieGoalEnabled: body.Profile.ManualCalorieGoalEnabled,
		WaterGoalML:              body.Profile.WaterGoalML,
		StepsGoal:                body.Profile.StepsGoal,
	}
	if err := h.service.Update(middleware.UserID(c), user, profile); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, gin.H{"message": "Профиль обновлён"})
}

func (h *ProfileHandler) UpdateGoals(c *gin.Context) {
	var profile models.Profile
	if err := c.ShouldBindJSON(&profile); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные цели")
		return
	}
	if err := h.service.UpdateGoals(middleware.UserID(c), profile); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, gin.H{"message": "Цели обновлены"})
}
