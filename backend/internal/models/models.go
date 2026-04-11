package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Name         string    `gorm:"not null" json:"name"`
	Theme        string    `gorm:"default:soft-pink" json:"theme"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Profile      Profile   `json:"profile"`
}

type Profile struct {
	ID                       uint      `gorm:"primaryKey" json:"id"`
	UserID                   uint      `gorm:"uniqueIndex;not null" json:"userId"`
	Gender                   string    `json:"gender"`
	HeightCM                 int       `json:"heightCm"`
	WeightKG                 float64   `json:"weightKg"`
	Age                      int       `json:"age"`
	ActivityLevel            string    `json:"activityLevel"`
	GoalType                 string    `json:"goalType"`
	DailyCalorieGoal         int       `json:"dailyCalorieGoal"`
	ManualCalorieGoalEnabled bool      `json:"manualCalorieGoalEnabled"`
	WaterGoalML              int       `json:"waterGoalMl"`
	StepsGoal                int       `json:"stepsGoal"`
	CreatedAt                time.Time `json:"createdAt"`
	UpdatedAt                time.Time `json:"updatedAt"`
}

type FoodEntry struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"index;not null" json:"userId"`
	EntryDate    time.Time `gorm:"index;not null" json:"entryDate"`
	MealCategory string    `gorm:"not null" json:"mealCategory"`
	Name         string    `gorm:"not null" json:"name"`
	Grams        float64   `json:"grams"`
	Calories     float64   `json:"calories"`
	Protein      float64   `json:"protein"`
	Fat          float64   `json:"fat"`
	Carbs        float64   `json:"carbs"`
	IsSweet      bool      `json:"isSweet"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type MealTemplate struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `gorm:"index;not null" json:"userId"`
	Name          string     `gorm:"not null" json:"name"`
	Description   string     `json:"description"`
	TotalCalories float64    `json:"totalCalories"`
	TotalProtein  float64    `json:"totalProtein"`
	TotalFat      float64    `json:"totalFat"`
	TotalCarbs    float64    `json:"totalCarbs"`
	Items         []MealItem `gorm:"foreignKey:MealID;constraint:OnDelete:CASCADE" json:"items"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type MealItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	MealID    uint    `gorm:"index;not null" json:"mealId"`
	Name      string  `gorm:"not null" json:"name"`
	Grams     float64 `json:"grams"`
	Calories  float64 `json:"calories"`
	Protein   float64 `json:"protein"`
	Fat       float64 `json:"fat"`
	Carbs     float64 `json:"carbs"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type WaterLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"userId"`
	LogDate   time.Time `gorm:"index;not null" json:"logDate"`
	AmountML  int       `json:"amountMl"`
	CreatedAt time.Time `json:"createdAt"`
}

type StepLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index:idx_user_date_steps,unique;not null" json:"userId"`
	LogDate   time.Time `gorm:"index:idx_user_date_steps,unique;not null" json:"logDate"`
	Steps     int       `json:"steps"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type WeightLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"userId"`
	LogDate   time.Time `gorm:"index;not null" json:"logDate"`
	WeightKG  float64   `json:"weightKg"`
	CreatedAt time.Time `json:"createdAt"`
}
