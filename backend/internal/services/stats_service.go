package services

import (
	"fmt"
	"sort"
	"time"

	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/repository"
	"kawaii-calorie-app/backend/internal/utils"
)

type StatsService struct {
	repo *repository.Repository
	*DiaryService
	*ProfileService
}

func NewStatsService(repo *repository.Repository, diary *DiaryService, profile *ProfileService) *StatsService {
	return &StatsService{repo: repo, DiaryService: diary, ProfileService: profile}
}

func (s *StatsService) Today(userID uint, date string) (map[string]interface{}, error) {
	profile, user, err := s.ProfileService.Get(userID)
	if err != nil {
		return nil, err
	}
	entries, err := s.DiaryService.GetEntries(userID, date)
	if err != nil {
		return nil, err
	}
	water, err := s.DiaryService.GetWater(userID, date)
	if err != nil {
		return nil, err
	}
	steps, err := s.DiaryService.GetSteps(userID, date)
	if err != nil {
		return nil, err
	}

	consumed, protein, fat, carbs, sweetCalories := 0.0, 0.0, 0.0, 0.0, 0.0
	mealCounts := map[string]int{}
	for _, entry := range entries {
		consumed += entry.Calories
		protein += entry.Protein
		fat += entry.Fat
		carbs += entry.Carbs
		mealCounts[entry.MealCategory]++
		if entry.IsSweet || entry.MealCategory == "сладкое" {
			sweetCalories += entry.Calories
		}
	}

	waterTotal := 0
	for _, item := range water {
		waterTotal += item.AmountML
	}

	goal := profile.DailyCalorieGoal
	remaining := float64(goal) - consumed
	progress := 0.0
	if goal > 0 {
		progress = consumed / float64(goal) * 100
	}

	kittyMood := map[string]string{"state": "happy", "title": "Kitty довольна", "message": "Ты мягко держишь баланс и выглядишь очень устойчиво."}
	if progress >= 90 && progress <= 105 {
		kittyMood = map[string]string{"state": "alert", "title": "Kitty насторожилась", "message": "Ты почти у границы цели. Осталось немного пространства на день."}
	} else if progress > 105 {
		kittyMood = map[string]string{"state": "sad", "title": "Kitty грустит", "message": "Цель уже превышена. Ничего страшного, просто сделай вечер чуть мягче и легче."}
	}

	balanceSummary := []string{}
	if protein < profile.WeightKG*0.8 {
		balanceSummary = append(balanceSummary, "Белка сегодня маловато, можно добавить что-то сытное и нежное по составу.")
	}
	if waterTotal < int(float64(profile.WaterGoalML)*0.7) {
		balanceSummary = append(balanceSummary, "Воды пока маловато. Пара стаканов уже заметно улучшат день.")
	}
	if sweetCalories > float64(goal)*0.25 {
		balanceSummary = append(balanceSummary, "Сладкого получилось щедро. Пусть следующие приёмы пищи будут чуть более сбалансированными.")
	}
	if len(balanceSummary) == 0 {
		balanceSummary = append(balanceSummary, "День выглядит очень сбалансированно. Мягкий темп и красивый ритм.")
	}

	challenge := s.challengeForUser(userID, normalizeDate(date))
	streak, badges, err := s.streak(userID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"user":           user,
		"goal":           goal,
		"consumed":       utils.Round1(consumed),
		"remaining":      utils.Round1(remaining),
		"progress":       utils.Round1(progress),
		"protein":        utils.Round1(protein),
		"fat":            utils.Round1(fat),
		"carbs":          utils.Round1(carbs),
		"waterMl":        waterTotal,
		"steps":          steps.Steps,
		"mealCounts":     mealCounts,
		"entries":        entries,
		"kittyMood":      kittyMood,
		"sweetCalories":  utils.Round1(sweetCalories),
		"balanceSummary": balanceSummary,
		"challenge":      challenge,
		"streak":         streak,
		"badges":         badges,
	}, nil
}

func (s *StatsService) History(userID uint) ([]map[string]interface{}, error) {
	var entries []models.FoodEntry
	if err := s.repo.DB.Where("user_id = ?", userID).Order("entry_date desc").Find(&entries).Error; err != nil {
		return nil, err
	}

	grouped := map[string]map[string]interface{}{}
	for _, entry := range entries {
		key := entry.EntryDate.Format("2006-01-02")
		if _, ok := grouped[key]; !ok {
			grouped[key] = map[string]interface{}{
				"date":     key,
				"calories": 0.0,
				"protein":  0.0,
				"fat":      0.0,
				"carbs":    0.0,
				"entries":  []models.FoodEntry{},
			}
		}
		grouped[key]["calories"] = grouped[key]["calories"].(float64) + entry.Calories
		grouped[key]["protein"] = grouped[key]["protein"].(float64) + entry.Protein
		grouped[key]["fat"] = grouped[key]["fat"].(float64) + entry.Fat
		grouped[key]["carbs"] = grouped[key]["carbs"].(float64) + entry.Carbs
		grouped[key]["entries"] = append(grouped[key]["entries"].([]models.FoodEntry), entry)
	}

	keys := make([]string, 0, len(grouped))
	for key := range grouped {
		keys = append(keys, key)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(keys)))

	result := make([]map[string]interface{}, 0, len(keys))
	for _, key := range keys {
		result = append(result, grouped[key])
	}
	return result, nil
}

func (s *StatsService) Summary(userID uint, calories float64) (map[string]interface{}, error) {
	today, err := s.Today(userID, "")
	if err != nil {
		return nil, err
	}
	remaining := today["remaining"].(float64)
	fit := calories <= remaining
	message := "Да, это спокойно вписывается в твой остаток на день."
	if !fit {
		message = fmt.Sprintf("Лучше оставить это на другой момент: превышение примерно на %.0f ккал.", calories-remaining)
	}
	return map[string]interface{}{
		"fit":              fit,
		"remaining":        remaining,
		"message":          message,
		"suggestedPortion": utils.Round1(remaining),
	}, nil
}

func (s *StatsService) Streak(userID uint) (map[string]interface{}, error) {
	count, badges, err := s.streak(userID)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"count": count, "badges": badges}, nil
}

func (s *StatsService) Challenge(userID uint, date string) map[string]interface{} {
	return s.challengeForUser(userID, normalizeDate(date))
}

func (s *StatsService) streak(userID uint) (int, []string, error) {
	activity := map[string]bool{}
	var entries []models.FoodEntry
	var water []models.WaterLog
	var steps []models.StepLog
	if err := s.repo.DB.Where("user_id = ?", userID).Find(&entries).Error; err != nil {
		return 0, nil, err
	}
	if err := s.repo.DB.Where("user_id = ?", userID).Find(&water).Error; err != nil {
		return 0, nil, err
	}
	if err := s.repo.DB.Where("user_id = ?", userID).Find(&steps).Error; err != nil {
		return 0, nil, err
	}
	for _, item := range entries {
		activity[item.EntryDate.Format("2006-01-02")] = true
	}
	for _, item := range water {
		activity[item.LogDate.Format("2006-01-02")] = true
	}
	for _, item := range steps {
		activity[item.LogDate.Format("2006-01-02")] = true
	}

	count := 0
	current := normalizeDate("")
	for {
		key := current.Format("2006-01-02")
		if !activity[key] {
			break
		}
		count++
		current = current.Add(-24 * time.Hour)
	}

	badges := []string{}
	if count >= 3 {
		badges = append(badges, "Cute discipline")
	}
	if count >= 7 {
		badges = append(badges, "Pink power")
	}
	if count >= 14 {
		badges = append(badges, "Kitty balance")
	}
	return count, badges, nil
}

func (s *StatsService) challengeForUser(userID uint, day time.Time) map[string]interface{} {
	challenges := []map[string]string{
		{"title": "Добей воду", "description": "Собери мягкие 2 литра воды за день."},
		{"title": "Не пропусти завтрак", "description": "Добавь завтрак в дневник до полудня."},
		{"title": "Добери белок", "description": "Сделай один белковый приём пищи сегодня."},
		{"title": "Добавь овощи", "description": "Пусть в одном из приёмов пищи будут овощи."},
	}
	index := int((int(userID) + day.YearDay()) % len(challenges))
	item := challenges[index]
	return map[string]interface{}{"title": item["title"], "description": item["description"]}
}
