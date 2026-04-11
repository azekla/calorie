package seed

import (
	"fmt"
	"time"

	"kawaii-calorie-app/backend/internal/config"
	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Run(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	cfg := config.Load()
	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.DemoPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	goal := utils.CalculateRecommendedCalories("женский", 58, 165, 24, "умеренная", "поддержание")
	user := models.User{
		Email:        cfg.DemoEmail,
		PasswordHash: string(hash),
		Name:         "Mika",
		Theme:        "strawberry-milk",
		Profile: models.Profile{
			Gender:                   "женский",
			HeightCM:                 165,
			WeightKG:                 58,
			Age:                      24,
			ActivityLevel:            "умеренная",
			GoalType:                 "поддержание",
			DailyCalorieGoal:         goal,
			ManualCalorieGoalEnabled: false,
			WaterGoalML:              2200,
			StepsGoal:                8500,
		},
	}
	if err := db.Create(&user).Error; err != nil {
		return err
	}

	favorites := []models.FavoriteFood{
		{Name: "Яйцо", DefaultGrams: 50, Calories: 78, Protein: 6.3, Fat: 5.3, Carbs: 0.6, Category: "завтрак"},
		{Name: "Рис", DefaultGrams: 100, Calories: 130, Protein: 2.7, Fat: 0.3, Carbs: 28, Category: "обед"},
		{Name: "Курица", DefaultGrams: 120, Calories: 198, Protein: 37, Fat: 4.3, Carbs: 0, Category: "обед"},
		{Name: "Банан", DefaultGrams: 100, Calories: 89, Protein: 1.1, Fat: 0.3, Carbs: 23, Category: "перекус"},
		{Name: "Хлеб", DefaultGrams: 40, Calories: 106, Protein: 3.4, Fat: 1.1, Carbs: 20.2, Category: "завтрак"},
		{Name: "Кофе", DefaultGrams: 240, Calories: 4, Protein: 0.3, Fat: 0, Carbs: 0, Category: "напитки"},
		{Name: "Сыр", DefaultGrams: 30, Calories: 108, Protein: 7.5, Fat: 8.6, Carbs: 0.3, Category: "перекус"},
		{Name: "Шоколад", DefaultGrams: 25, Calories: 134, Protein: 1.8, Fat: 8.6, Carbs: 13.8, Category: "сладкое", IsSweet: true},
	}
	for i := range favorites {
		favorites[i].UserID = user.ID
	}
	if err := db.Create(&favorites).Error; err != nil {
		return err
	}

	meals := []models.MealTemplate{
		{Name: "Нежный завтрак", Description: "Яйца, хлеб и сыр", UserID: user.ID, Items: []models.MealItem{{Name: "Яйцо", Grams: 100, Calories: 156, Protein: 12.6, Fat: 10.6, Carbs: 1.2}, {Name: "Хлеб", Grams: 100, Calories: 265, Protein: 8.5, Fat: 2.7, Carbs: 50.5}, {Name: "Сыр", Grams: 30, Calories: 108, Protein: 7.5, Fat: 8.6, Carbs: 0.3}}},
		{Name: "Ланч balance", Description: "Рис и курица", UserID: user.ID, Items: []models.MealItem{{Name: "Рис", Grams: 150, Calories: 195, Protein: 4.1, Fat: 0.4, Carbs: 42}, {Name: "Курица", Grams: 150, Calories: 248, Protein: 46.2, Fat: 5.4, Carbs: 0}}},
	}
	for i := range meals {
		for j := range meals[i].Items {
			meals[i].TotalCalories += meals[i].Items[j].Calories
			meals[i].TotalProtein += meals[i].Items[j].Protein
			meals[i].TotalFat += meals[i].Items[j].Fat
			meals[i].TotalCarbs += meals[i].Items[j].Carbs
		}
	}
	if err := db.Create(&meals).Error; err != nil {
		return err
	}

	base := time.Now()
	for dayOffset := 0; dayOffset < 7; dayOffset++ {
		day := time.Date(base.Year(), base.Month(), base.Day()-dayOffset, 0, 0, 0, 0, time.Local)
		entries := []models.FoodEntry{
			{UserID: user.ID, EntryDate: day, MealCategory: "завтрак", Name: "Овсянка с бананом", Grams: 250, Calories: 320 + float64(dayOffset*3), Protein: 11, Fat: 6, Carbs: 54},
			{UserID: user.ID, EntryDate: day, MealCategory: "обед", Name: "Рис с курицей", Grams: 280, Calories: 465 + float64(dayOffset*2), Protein: 47, Fat: 6, Carbs: 42},
			{UserID: user.ID, EntryDate: day, MealCategory: "сладкое", Name: fmt.Sprintf("Клубничный десерт %d", dayOffset+1), Grams: 60, Calories: 140, Protein: 2, Fat: 7, Carbs: 18, IsSweet: true},
		}
		if err := db.Create(&entries).Error; err != nil {
			return err
		}
		if err := db.Create(&[]models.WaterLog{{UserID: user.ID, LogDate: day, AmountML: 500}, {UserID: user.ID, LogDate: day, AmountML: 750}, {UserID: user.ID, LogDate: day, AmountML: 250}}).Error; err != nil {
			return err
		}
		if err := db.Create(&models.StepLog{UserID: user.ID, LogDate: day, Steps: 6300 + dayOffset*420}).Error; err != nil {
			return err
		}
		if err := db.Create(&models.WeightLog{UserID: user.ID, LogDate: day, WeightKG: 58.8 - float64(dayOffset)*0.15}).Error; err != nil {
			return err
		}
	}

	return nil
}
