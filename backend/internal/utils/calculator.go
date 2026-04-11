package utils

import (
	"math"
	"strings"
)

func NormalizeGender(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "female", "женский":
		return "женский"
	case "male", "мужской":
		return "мужской"
	default:
		return strings.TrimSpace(value)
	}
}

func NormalizeActivityLevel(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "low", "низкая":
		return "низкая"
	case "medium", "умеренная":
		return "умеренная"
	case "high", "высокая":
		return "высокая"
	default:
		return strings.TrimSpace(value)
	}
}

func NormalizeGoalType(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "lose", "похудение":
		return "lose"
	case "maintain", "поддержание":
		return "maintain"
	case "gain", "набор массы":
		return "gain"
	default:
		return strings.TrimSpace(value)
	}
}

func CalculateRecommendedCalories(gender string, weightKG float64, heightCM, age int, activityLevel, goalType string) int {
	if weightKG <= 0 || heightCM <= 0 || age <= 0 {
		return 2000
	}

	gender = NormalizeGender(gender)
	activityLevel = NormalizeActivityLevel(activityLevel)
	goalType = NormalizeGoalType(goalType)

	bmr := 10*weightKG + 6.25*float64(heightCM) - 5*float64(age)
	if gender == "женский" {
		bmr -= 161
	} else {
		bmr += 5
	}

	multiplier := 1.2
	switch activityLevel {
	case "низкая":
		multiplier = 1.375
	case "умеренная":
		multiplier = 1.55
	case "высокая":
		multiplier = 1.725
	}

	calories := bmr * multiplier
	switch goalType {
	case "lose":
		calories -= 300
	case "gain":
		calories += 250
	}

	return int(math.Round(calories))
}

func Round1(v float64) float64 {
	return math.Round(v*10) / 10
}
