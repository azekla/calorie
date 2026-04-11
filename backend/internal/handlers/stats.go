package handlers

import (
	"net/http"
	"strconv"

	"kawaii-calorie-app/backend/internal/middleware"
	"kawaii-calorie-app/backend/internal/services"
	"kawaii-calorie-app/backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	service *services.StatsService
}

func NewStatsHandler(service *services.StatsService) *StatsHandler {
	return &StatsHandler{service: service}
}

func (h *StatsHandler) Today(c *gin.Context) {
	data, err := h.service.Today(middleware.UserID(c), c.Query("date"))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось собрать статистику дня")
		return
	}
	utils.JSON(c, http.StatusOK, data)
}

func (h *StatsHandler) History(c *gin.Context) {
	data, err := h.service.History(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить историю")
		return
	}
	utils.JSON(c, http.StatusOK, data)
}

func (h *StatsHandler) Summary(c *gin.Context) {
	data, err := h.service.Today(middleware.UserID(c), c.Query("date"))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить summary")
		return
	}
	utils.JSON(c, http.StatusOK, data)
}

func (h *StatsHandler) CanIEat(c *gin.Context) {
	var body struct {
		Calories float64 `json:"calories"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, "Некорректные данные калькулятора")
		return
	}
	data, err := h.service.Summary(middleware.UserID(c), body.Calories)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось рассчитать ответ")
		return
	}
	utils.JSON(c, http.StatusOK, data)
}

func (h *StatsHandler) Challenge(c *gin.Context) {
	utils.JSON(c, http.StatusOK, h.service.Challenge(middleware.UserID(c), c.Query("date")))
}

func (h *StatsHandler) Streak(c *gin.Context) {
	data, err := h.service.Streak(middleware.UserID(c))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Не удалось получить streak")
		return
	}
	utils.JSON(c, http.StatusOK, data)
}

func (h *StatsHandler) Health(c *gin.Context) {
	_, _ = strconv.Atoi("0")
	utils.JSON(c, http.StatusOK, gin.H{"status": "ok"})
}
