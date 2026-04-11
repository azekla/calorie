package middleware

import (
	"net/http"

	"kawaii-calorie-app/backend/internal/config"
	"kawaii-calorie-app/backend/internal/utils"

	"github.com/gin-gonic/gin"
)

const userIDKey = "userID"

func AuthRequired(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil || token == "" {
			utils.Error(c, http.StatusUnauthorized, "Требуется авторизация")
			c.Abort()
			return
		}

		userID, err := utils.ParseToken(cfg.JWTSecret, token)
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "Сессия истекла, войдите снова")
			c.Abort()
			return
		}

		c.Set(userIDKey, userID)
		c.Next()
	}
}

func UserID(c *gin.Context) uint {
	value, _ := c.Get(userIDKey)
	if userID, ok := value.(uint); ok {
		return userID
	}
	return 0
}
