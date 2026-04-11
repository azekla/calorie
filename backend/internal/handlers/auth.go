package handlers

import (
	"net/http"

	"kawaii-calorie-app/backend/internal/config"
	"kawaii-calorie-app/backend/internal/middleware"
	"kawaii-calorie-app/backend/internal/services"
	"kawaii-calorie-app/backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *services.AuthService
	cfg     config.Config
}

func NewAuthHandler(service *services.AuthService, cfg config.Config) *AuthHandler {
	return &AuthHandler{service: service, cfg: cfg}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Profile  struct {
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
		utils.Error(c, http.StatusBadRequest, "Некорректные данные")
		return
	}
	user, err := h.service.Register(body.Name, body.Email, body.Password, services.RegisterProfileInput{
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
	})
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	h.setSession(c, user.ID)
	utils.JSON(c, http.StatusCreated, user)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные")
		return
	}
	user, err := h.service.Login(body.Email, body.Password)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	h.setSession(c, user.ID)
	utils.JSON(c, http.StatusOK, user)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", "", h.cfg.CookieSecure, true)
	utils.JSON(c, http.StatusOK, gin.H{"message": "Выход выполнен"})
}

func (h *AuthHandler) Me(c *gin.Context) {
	user, err := h.service.Me(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Пользователь не найден")
		return
	}
	utils.JSON(c, http.StatusOK, user)
}

func (h *AuthHandler) setSession(c *gin.Context, userID uint) {
	token, _ := utils.GenerateToken(h.cfg.JWTSecret, userID)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 7*24*3600, "/", "", h.cfg.CookieSecure, true)
}
