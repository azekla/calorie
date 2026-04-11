package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(secret string, userID uint) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func ParseToken(secret, tokenString string) (uint, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return 0, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, jwt.ErrTokenInvalidClaims
	}
	value, ok := claims["sub"].(float64)
	if !ok {
		return 0, jwt.ErrTokenInvalidClaims
	}
	return uint(value), nil
}
