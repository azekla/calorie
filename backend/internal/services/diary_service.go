package services

import (
	"errors"
	"time"

	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/repository"
	"kawaii-calorie-app/backend/internal/utils"

	"gorm.io/gorm"
)

type DiaryService struct {
	repo *repository.Repository
}

func NewDiaryService(repo *repository.Repository) *DiaryService {
	return &DiaryService{repo: repo}
}

func normalizeDate(date string) time.Time {
	if date == "" {
		now := time.Now()
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	}
	parsed, err := time.Parse("2006-01-02", date)
	if err != nil {
		now := time.Now()
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	}
	return parsed
}

func (s *DiaryService) GetEntries(userID uint, date string) ([]models.FoodEntry, error) {
	day := normalizeDate(date)
	start := day
	end := day.Add(24 * time.Hour)
	var entries []models.FoodEntry
	err := s.repo.DB.Where("user_id = ? AND entry_date >= ? AND entry_date < ?", userID, start, end).
		Order("entry_date asc, id asc").Find(&entries).Error
	return entries, err
}

func (s *DiaryService) CreateEntry(userID uint, entry models.FoodEntry) (*models.FoodEntry, error) {
	if entry.Name == "" || entry.Calories < 0 {
		return nil, errors.New("укажите название и корректные значения")
	}
	if entry.EntryDate.IsZero() {
		entry.EntryDate = normalizeDate("")
	}
	entry.UserID = userID
	entry.Calories = utils.Round1(entry.Calories)
	entry.Protein = utils.Round1(entry.Protein)
	entry.Fat = utils.Round1(entry.Fat)
	entry.Carbs = utils.Round1(entry.Carbs)
	if err := s.repo.DB.Create(&entry).Error; err != nil {
		return nil, err
	}
	return &entry, nil
}

func (s *DiaryService) UpdateEntry(userID, id uint, entry models.FoodEntry) (*models.FoodEntry, error) {
	var existing models.FoodEntry
	if err := s.repo.DB.Where("user_id = ? AND id = ?", userID, id).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("запись не найдена")
		}
		return nil, err
	}
	entry.UserID = userID
	entry.ID = id
	if entry.EntryDate.IsZero() {
		entry.EntryDate = existing.EntryDate
	}
	if err := s.repo.DB.Model(&existing).Updates(entry).Error; err != nil {
		return nil, err
	}
	if err := s.repo.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		return nil, err
	}
	return &existing, nil
}

func (s *DiaryService) DeleteEntry(userID, id uint) error {
	result := s.repo.DB.Where("user_id = ? AND id = ?", userID, id).Delete(&models.FoodEntry{})
	if result.RowsAffected == 0 {
		return errors.New("запись не найдена")
	}
	return result.Error
}

func (s *DiaryService) GetFavorites(userID uint) ([]models.FavoriteFood, error) {
	var favorites []models.FavoriteFood
	err := s.repo.DB.Where("user_id = ?", userID).Order("name asc").Find(&favorites).Error
	return favorites, err
}

func (s *DiaryService) CreateFavorite(userID uint, favorite models.FavoriteFood) (*models.FavoriteFood, error) {
	if favorite.Name == "" {
		return nil, errors.New("название обязательно")
	}
	favorite.UserID = userID
	if err := s.repo.DB.Create(&favorite).Error; err != nil {
		return nil, err
	}
	return &favorite, nil
}

func (s *DiaryService) DeleteFavorite(userID, id uint) error {
	result := s.repo.DB.Where("user_id = ? AND id = ?", userID, id).Delete(&models.FavoriteFood{})
	if result.RowsAffected == 0 {
		return errors.New("избранное не найдено")
	}
	return result.Error
}

func (s *DiaryService) GetMeals(userID uint) ([]models.MealTemplate, error) {
	var meals []models.MealTemplate
	err := s.repo.DB.Preload("Items").Where("user_id = ?", userID).Order("updated_at desc").Find(&meals).Error
	return meals, err
}

func (s *DiaryService) SaveMeal(userID uint, meal models.MealTemplate) (*models.MealTemplate, error) {
	if meal.Name == "" || len(meal.Items) == 0 {
		return nil, errors.New("укажите название и минимум один ингредиент")
	}
	meal.UserID = userID
	meal.TotalCalories = 0
	meal.TotalProtein = 0
	meal.TotalFat = 0
	meal.TotalCarbs = 0
	for i := range meal.Items {
		meal.TotalCalories += meal.Items[i].Calories
		meal.TotalProtein += meal.Items[i].Protein
		meal.TotalFat += meal.Items[i].Fat
		meal.TotalCarbs += meal.Items[i].Carbs
	}
	if err := s.repo.DB.Create(&meal).Error; err != nil {
		return nil, err
	}
	if err := s.repo.DB.Preload("Items").First(&meal, meal.ID).Error; err != nil {
		return nil, err
	}
	return &meal, nil
}

func (s *DiaryService) UpdateMeal(userID, id uint, meal models.MealTemplate) (*models.MealTemplate, error) {
	var existing models.MealTemplate
	if err := s.repo.DB.Preload("Items").Where("user_id = ? AND id = ?", userID, id).First(&existing).Error; err != nil {
		return nil, errors.New("шаблон блюда не найден")
	}
	meal.UserID = userID
	meal.ID = id
	meal.TotalCalories = 0
	meal.TotalProtein = 0
	meal.TotalFat = 0
	meal.TotalCarbs = 0
	for _, item := range meal.Items {
		meal.TotalCalories += item.Calories
		meal.TotalProtein += item.Protein
		meal.TotalFat += item.Fat
		meal.TotalCarbs += item.Carbs
	}
	returnValue := existing
	err := s.repo.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&existing).Updates(map[string]interface{}{
			"name":           meal.Name,
			"description":    meal.Description,
			"total_calories": meal.TotalCalories,
			"total_protein":  meal.TotalProtein,
			"total_fat":      meal.TotalFat,
			"total_carbs":    meal.TotalCarbs,
		}).Error; err != nil {
			return err
		}
		if err := tx.Where("meal_id = ?", id).Delete(&models.MealItem{}).Error; err != nil {
			return err
		}
		for _, item := range meal.Items {
			item.MealID = id
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}
		return tx.Preload("Items").First(&returnValue, id).Error
	})
	if err != nil {
		return nil, err
	}
	return &returnValue, nil
}

func (s *DiaryService) DeleteMeal(userID, id uint) error {
	return s.repo.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("meal_id = ?", id).Delete(&models.MealItem{}).Error; err != nil {
			return err
		}
		result := tx.Where("user_id = ? AND id = ?", userID, id).Delete(&models.MealTemplate{})
		if result.RowsAffected == 0 {
			return errors.New("шаблон блюда не найден")
		}
		return result.Error
	})
}

func (s *DiaryService) AddMealToDay(userID, id uint, date string, category string) ([]models.FoodEntry, error) {
	var meal models.MealTemplate
	if err := s.repo.DB.Preload("Items").Where("user_id = ? AND id = ?", userID, id).First(&meal).Error; err != nil {
		return nil, errors.New("шаблон блюда не найден")
	}
	day := normalizeDate(date)
	created := make([]models.FoodEntry, 0, len(meal.Items))
	for _, item := range meal.Items {
		entry := models.FoodEntry{
			UserID:       userID,
			EntryDate:    day,
			MealCategory: category,
			Name:         item.Name,
			Grams:        item.Grams,
			Calories:     item.Calories,
			Protein:      item.Protein,
			Fat:          item.Fat,
			Carbs:        item.Carbs,
		}
		if err := s.repo.DB.Create(&entry).Error; err != nil {
			return nil, err
		}
		created = append(created, entry)
	}
	return created, nil
}

func (s *DiaryService) GetWater(userID uint, date string) ([]models.WaterLog, error) {
	day := normalizeDate(date)
	var logs []models.WaterLog
	err := s.repo.DB.Where("user_id = ? AND log_date >= ? AND log_date < ?", userID, day, day.Add(24*time.Hour)).Order("created_at asc").Find(&logs).Error
	return logs, err
}

func (s *DiaryService) AddWater(userID uint, amountML int, date string, reset bool) error {
	day := normalizeDate(date)
	if reset {
		return s.repo.DB.Where("user_id = ? AND log_date >= ? AND log_date < ?", userID, day, day.Add(24*time.Hour)).Delete(&models.WaterLog{}).Error
	}
	if amountML <= 0 {
		return errors.New("объем воды должен быть больше нуля")
	}
	return s.repo.DB.Create(&models.WaterLog{UserID: userID, LogDate: day, AmountML: amountML}).Error
}

func (s *DiaryService) GetSteps(userID uint, date string) (*models.StepLog, error) {
	day := normalizeDate(date)
	var log models.StepLog
	err := s.repo.DB.Where("user_id = ? AND log_date = ?", userID, day).First(&log).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &models.StepLog{LogDate: day, Steps: 0}, nil
	}
	return &log, err
}

func (s *DiaryService) SaveSteps(userID uint, steps int, date string) (*models.StepLog, error) {
	if steps < 0 {
		return nil, errors.New("шаги не могут быть отрицательными")
	}
	day := normalizeDate(date)
	log := models.StepLog{UserID: userID, LogDate: day}
	err := s.repo.DB.Where(models.StepLog{UserID: userID, LogDate: day}).Assign(models.StepLog{Steps: steps}).FirstOrCreate(&log).Error
	if err != nil {
		return nil, err
	}
	if err := s.repo.DB.Where("id = ?", log.ID).First(&log).Error; err != nil {
		return nil, err
	}
	return &log, nil
}

func (s *DiaryService) GetWeight(userID uint) ([]models.WeightLog, error) {
	var logs []models.WeightLog
	err := s.repo.DB.Where("user_id = ?", userID).Order("log_date asc").Find(&logs).Error
	return logs, err
}

func (s *DiaryService) AddWeight(userID uint, weightKG float64, date string) (*models.WeightLog, error) {
	if weightKG <= 0 {
		return nil, errors.New("вес должен быть больше нуля")
	}
	entry := models.WeightLog{UserID: userID, LogDate: normalizeDate(date), WeightKG: weightKG}
	if err := s.repo.DB.Create(&entry).Error; err != nil {
		return nil, err
	}
	return &entry, nil
}
