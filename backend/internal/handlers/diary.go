package handlers

import (
	"net/http"
	"strconv"
	"time"

	"kawaii-calorie-app/backend/internal/middleware"
	"kawaii-calorie-app/backend/internal/models"
	"kawaii-calorie-app/backend/internal/services"
	"kawaii-calorie-app/backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type DiaryHandler struct {
	service *services.DiaryService
}

func NewDiaryHandler(service *services.DiaryService) *DiaryHandler {
	return &DiaryHandler{service: service}
}

func parseID(c *gin.Context) (uint, bool) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		utils.Error(c, http.StatusBadRequest, "Некорректный идентификатор")
		return 0, false
	}
	return uint(id), true
}

func (h *DiaryHandler) GetEntries(c *gin.Context) {
	entries, err := h.service.GetEntries(middleware.UserID(c), c.Query("date"))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить записи")
		return
	}
	utils.JSON(c, http.StatusOK, entries)
}

func (h *DiaryHandler) GetRecentEntries(c *gin.Context) {
	entries, err := h.service.GetRecentEntries(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить последние записи")
		return
	}
	utils.JSON(c, http.StatusOK, entries)
}

func (h *DiaryHandler) CreateEntry(c *gin.Context) {
	var body struct {
		EntryDate    string  `json:"entryDate"`
		MealCategory string  `json:"mealCategory"`
		Name         string  `json:"name"`
		Grams        float64 `json:"grams"`
		Calories     float64 `json:"calories"`
		Protein      float64 `json:"protein"`
		Fat          float64 `json:"fat"`
		Carbs        float64 `json:"carbs"`
		IsSweet      bool    `json:"isSweet"`
		Notes        string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные записи")
		return
	}
	entryDate, err := parseOptionalDate(body.EntryDate)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректная дата записи")
		return
	}
	entry := models.FoodEntry{
		EntryDate:    entryDate,
		MealCategory: body.MealCategory,
		Name:         body.Name,
		Grams:        body.Grams,
		Calories:     body.Calories,
		Protein:      body.Protein,
		Fat:          body.Fat,
		Carbs:        body.Carbs,
		IsSweet:      body.IsSweet,
		Notes:        body.Notes,
	}
	created, err := h.service.CreateEntry(middleware.UserID(c), entry)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusCreated, created)
}

func (h *DiaryHandler) UpdateEntry(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	var body struct {
		EntryDate    string  `json:"entryDate"`
		MealCategory string  `json:"mealCategory"`
		Name         string  `json:"name"`
		Grams        float64 `json:"grams"`
		Calories     float64 `json:"calories"`
		Protein      float64 `json:"protein"`
		Fat          float64 `json:"fat"`
		Carbs        float64 `json:"carbs"`
		IsSweet      bool    `json:"isSweet"`
		Notes        string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные записи")
		return
	}
	entryDate, err := parseOptionalDate(body.EntryDate)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректная дата записи")
		return
	}
	entry := models.FoodEntry{
		EntryDate:    entryDate,
		MealCategory: body.MealCategory,
		Name:         body.Name,
		Grams:        body.Grams,
		Calories:     body.Calories,
		Protein:      body.Protein,
		Fat:          body.Fat,
		Carbs:        body.Carbs,
		IsSweet:      body.IsSweet,
		Notes:        body.Notes,
	}
	updated, err := h.service.UpdateEntry(middleware.UserID(c), id, entry)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, updated)
}

func parseOptionalDate(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err == nil {
		return parsed, nil
	}
	return time.Parse(time.RFC3339, value)
}

func (h *DiaryHandler) DeleteEntry(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	if err := h.service.DeleteEntry(middleware.UserID(c), id); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, gin.H{"message": "Запись удалена"})
}

func (h *DiaryHandler) GetMeals(c *gin.Context) {
	meals, err := h.service.GetMeals(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить шаблоны блюд")
		return
	}
	utils.JSON(c, http.StatusOK, meals)
}

func (h *DiaryHandler) CreateMeal(c *gin.Context) {
	var meal models.MealTemplate
	if err := c.ShouldBindJSON(&meal); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные блюда")
		return
	}
	created, err := h.service.SaveMeal(middleware.UserID(c), meal)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusCreated, created)
}

func (h *DiaryHandler) UpdateMeal(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	var meal models.MealTemplate
	if err := c.ShouldBindJSON(&meal); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные блюда")
		return
	}
	updated, err := h.service.UpdateMeal(middleware.UserID(c), id, meal)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, updated)
}

func (h *DiaryHandler) DeleteMeal(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	if err := h.service.DeleteMeal(middleware.UserID(c), id); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, gin.H{"message": "Шаблон блюда удалён"})
}

func (h *DiaryHandler) AddMealToDay(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}
	var body struct {
		Date     string `json:"date"`
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные")
		return
	}
	entries, err := h.service.AddMealToDay(middleware.UserID(c), id, body.Date, body.Category)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusCreated, entries)
}

func (h *DiaryHandler) GetWater(c *gin.Context) {
	logs, err := h.service.GetWater(middleware.UserID(c), c.Query("date"))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить воду")
		return
	}
	utils.JSON(c, http.StatusOK, logs)
}

func (h *DiaryHandler) AddWater(c *gin.Context) {
	var body struct {
		AmountML int    `json:"amountMl"`
		Date     string `json:"date"`
		Reset    bool   `json:"reset"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные воды")
		return
	}
	if err := h.service.AddWater(middleware.UserID(c), body.AmountML, body.Date, body.Reset); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, gin.H{"message": "Вода обновлена"})
}

func (h *DiaryHandler) GetSteps(c *gin.Context) {
	steps, err := h.service.GetSteps(middleware.UserID(c), c.Query("date"))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить шаги")
		return
	}
	utils.JSON(c, http.StatusOK, steps)
}

func (h *DiaryHandler) SaveSteps(c *gin.Context) {
	var body struct {
		Steps int    `json:"steps"`
		Date  string `json:"date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные шагов")
		return
	}
	steps, err := h.service.SaveSteps(middleware.UserID(c), body.Steps, body.Date)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, steps)
}

func (h *DiaryHandler) GetWeight(c *gin.Context) {
	logs, err := h.service.GetWeight(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить историю веса")
		return
	}
	utils.JSON(c, http.StatusOK, logs)
}

func (h *DiaryHandler) AddWeight(c *gin.Context) {
	var body struct {
		WeightKG float64 `json:"weightKg"`
		Date     string  `json:"date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные веса")
		return
	}
	entry, err := h.service.AddWeight(middleware.UserID(c), body.WeightKG, body.Date)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.JSON(c, http.StatusCreated, entry)
}
