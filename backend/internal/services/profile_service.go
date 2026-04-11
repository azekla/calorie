package services

import (
	"errors"
	"strings"

	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/repository"
	"kawaii-calorie-app/backend/internal/utils"
)

type ProfileService struct {
	repo *repository.Repository
}

func NewProfileService(repo *repository.Repository) *ProfileService {
	return &ProfileService{repo: repo}
}

func (s *ProfileService) Get(userID uint) (*models.Profile, *models.User, error) {
	var user models.User
	if err := s.repo.DB.Preload("Profile").First(&user, userID).Error; err != nil {
		return nil, nil, err
	}
	profile := user.Profile
	profile.Gender = utils.NormalizeGender(profile.Gender)
	profile.ActivityLevel = utils.NormalizeActivityLevel(profile.ActivityLevel)
	profile.GoalType = utils.NormalizeGoalType(profile.GoalType)
	if !profile.ManualCalorieGoalEnabled {
		profile.DailyCalorieGoal = utils.CalculateRecommendedCalories(profile.Gender, profile.WeightKG, profile.HeightCM, profile.Age, profile.ActivityLevel, profile.GoalType)
	}
	return &profile, &user, nil
}

func (s *ProfileService) Update(userID uint, user models.User, profile models.Profile) error {
	if strings.TrimSpace(user.Name) == "" {
		return errors.New("имя не может быть пустым")
	}
	if profile.HeightCM <= 0 || profile.Age <= 0 || profile.WeightKG <= 0 {
		return errors.New("рост, вес и возраст должны быть больше нуля")
	}
	profile.Gender = utils.NormalizeGender(profile.Gender)
	profile.ActivityLevel = utils.NormalizeActivityLevel(profile.ActivityLevel)
	profile.GoalType = utils.NormalizeGoalType(profile.GoalType)

	updates := map[string]interface{}{
		"name":  strings.TrimSpace(user.Name),
		"theme": user.Theme,
	}
	if err := s.repo.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		return err
	}

	if !profile.ManualCalorieGoalEnabled {
		profile.DailyCalorieGoal = utils.CalculateRecommendedCalories(profile.Gender, profile.WeightKG, profile.HeightCM, profile.Age, profile.ActivityLevel, profile.GoalType)
	}

	return s.repo.DB.Model(&models.Profile{}).Where("user_id = ?", userID).Updates(profile).Error
}

func (s *ProfileService) UpdateGoals(userID uint, profile models.Profile) error {
	profile.GoalType = utils.NormalizeGoalType(profile.GoalType)
	profile.ActivityLevel = utils.NormalizeActivityLevel(profile.ActivityLevel)
	profile.Gender = utils.NormalizeGender(profile.Gender)
	if profile.ManualCalorieGoalEnabled && profile.DailyCalorieGoal <= 0 {
		return errors.New("ручная цель калорий должна быть больше нуля")
	}
	if !profile.ManualCalorieGoalEnabled {
		profile.DailyCalorieGoal = utils.CalculateRecommendedCalories(profile.Gender, profile.WeightKG, profile.HeightCM, profile.Age, profile.ActivityLevel, profile.GoalType)
	}
	return s.repo.DB.Model(&models.Profile{}).Where("user_id = ?", userID).Updates(map[string]interface{}{
		"goal_type":                   profile.GoalType,
		"daily_calorie_goal":          profile.DailyCalorieGoal,
		"manual_calorie_goal_enabled": profile.ManualCalorieGoalEnabled,
		"water_goal_ml":               profile.WaterGoalML,
		"steps_goal":                  profile.StepsGoal,
	}).Error
}
