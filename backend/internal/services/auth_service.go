package services

import (
	"errors"
	"fmt"
	"strings"

	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/repository"
	"kawaii-calorie-app/backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterProfileInput struct {
	Gender                   string
	HeightCM                 int
	WeightKG                 float64
	Age                      int
	ActivityLevel            string
	GoalType                 string
	DailyCalorieGoal         int
	ManualCalorieGoalEnabled bool
	WaterGoalML              int
	StepsGoal                int
}

type AuthService struct {
	repo *repository.Repository
}

func NewAuthService(repo *repository.Repository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(name, email, password string, profileInput RegisterProfileInput) (*models.User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || len(password) < 6 || strings.TrimSpace(name) == "" {
		return nil, errors.New("заполните имя, email и пароль не короче 6 символов")
	}
	if profileInput.HeightCM <= 0 || profileInput.Age <= 0 || profileInput.WeightKG <= 0 {
		return nil, errors.New("заполните рост, вес и возраст")
	}

	var existing models.User
	if err := s.repo.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, errors.New("пользователь с таким email уже существует")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	gender := utils.NormalizeGender(profileInput.Gender)
	activityLevel := utils.NormalizeActivityLevel(profileInput.ActivityLevel)
	goalType := utils.NormalizeGoalType(profileInput.GoalType)
	if gender == "" || activityLevel == "" || goalType == "" {
		return nil, errors.New("заполните пол, активность и цель")
	}
	if profileInput.WaterGoalML <= 0 {
		profileInput.WaterGoalML = 2000
	}
	if profileInput.StepsGoal <= 0 {
		profileInput.StepsGoal = 8000
	}
	dailyCalorieGoal := profileInput.DailyCalorieGoal
	if profileInput.ManualCalorieGoalEnabled {
		if dailyCalorieGoal <= 0 {
			return nil, errors.New("ручная норма калорий должна быть больше нуля")
		}
	} else {
		dailyCalorieGoal = utils.CalculateRecommendedCalories(gender, profileInput.WeightKG, profileInput.HeightCM, profileInput.Age, activityLevel, goalType)
	}

	user := models.User{
		Email:        email,
		PasswordHash: string(hash),
		Name:         strings.TrimSpace(name),
		Theme:        "soft-pink",
		Profile: models.Profile{
			Gender:                   gender,
			HeightCM:                 profileInput.HeightCM,
			WeightKG:                 profileInput.WeightKG,
			Age:                      profileInput.Age,
			ActivityLevel:            activityLevel,
			GoalType:                 goalType,
			DailyCalorieGoal:         dailyCalorieGoal,
			ManualCalorieGoalEnabled: profileInput.ManualCalorieGoalEnabled,
			WaterGoalML:              profileInput.WaterGoalML,
			StepsGoal:                profileInput.StepsGoal,
		},
	}

	if err := s.repo.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	if err := s.repo.DB.Preload("Profile").First(&user, user.ID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) TelegramLogin(userData *utils.TelegramUser) (*models.User, error) {
	var user models.User
	if err := s.repo.DB.Preload("Profile").Where("telegram_id = ?", userData.ID).First(&user).Error; err == nil {
		return &user, nil
	}

	slug := strings.TrimSpace(strings.ToLower(userData.Username))
	if slug == "" {
		slug = strings.TrimSpace(strings.ToLower(strings.Join([]string{userData.FirstName, userData.LastName}, "_")))
		slug = strings.ReplaceAll(slug, " ", "_")
		slug = strings.ReplaceAll(slug, "__", "_")
	}
	slug = strings.Trim(slug, "_")
	if slug == "" {
		slug = "telegram_user"
	}
	generatedEmail := fmt.Sprintf("%s_%d@telegram.local", slug, userData.ID)

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("telegram-login-disabled"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	name := strings.TrimSpace(strings.Join([]string{userData.FirstName, userData.LastName}, " "))
	if name == "" {
		name = "Telegram User"
	}
	telegramID := userData.ID
	user = models.User{
		Email:             generatedEmail,
		PasswordHash:      string(passwordHash),
		Name:              name,
		Theme:             "soft-pink",
		TelegramID:        &telegramID,
		TelegramUsername:  userData.Username,
		TelegramFirstName: userData.FirstName,
		TelegramLastName:  userData.LastName,
		Profile: models.Profile{
			Gender:           "женский",
			HeightCM:         165,
			WeightKG:         58,
			Age:              24,
			ActivityLevel:    "умеренная",
			GoalType:         "maintain",
			DailyCalorieGoal: 2000,
			WaterGoalML:      2000,
			StepsGoal:        8000,
		},
	}
	if err := s.repo.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	if err := s.repo.DB.Preload("Profile").First(&user, user.ID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) Login(email, password string) (*models.User, error) {
	var user models.User
	if err := s.repo.DB.Preload("Profile").Where("email = ?", strings.ToLower(strings.TrimSpace(email))).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("неверный email или пароль")
		}
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("неверный email или пароль")
	}
	return &user, nil
}

func (s *AuthService) Me(userID uint) (*models.User, error) {
	var user models.User
	if err := s.repo.DB.Preload("Profile").Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}
	if !user.Profile.ManualCalorieGoalEnabled {
		user.Profile.DailyCalorieGoal = utils.CalculateRecommendedCalories(
			user.Profile.Gender,
			user.Profile.WeightKG,
			user.Profile.HeightCM,
			user.Profile.Age,
			user.Profile.ActivityLevel,
			user.Profile.GoalType,
		)
	}
	return &user, nil
}
