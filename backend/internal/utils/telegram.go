package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

type TelegramUser struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func VerifyTelegramInitData(botToken, initData string) (*TelegramUser, error) {
	if botToken == "" {
		return nil, errors.New("Telegram auth пока не настроен на сервере")
	}
	if strings.TrimSpace(initData) == "" {
		return nil, errors.New("Пустые данные Telegram Web App")
	}

	values, err := url.ParseQuery(initData)
	if err != nil {
		return nil, errors.New("Некорректные данные Telegram Web App")
	}

	hash := values.Get("hash")
	if hash == "" {
		return nil, errors.New("Отсутствует подпись Telegram")
	}
	values.Del("hash")

	dataCheckStrings := make([]string, 0, len(values))
	for key, entries := range values {
		if len(entries) == 0 {
			continue
		}
		dataCheckStrings = append(dataCheckStrings, key+"="+entries[0])
	}
	sort.Strings(dataCheckStrings)
	dataCheckString := strings.Join(dataCheckStrings, "\n")

	secretSeed := hmac.New(sha256.New, []byte("WebAppData"))
	secretSeed.Write([]byte(botToken))
	secret := secretSeed.Sum(nil)

	check := hmac.New(sha256.New, secret)
	check.Write([]byte(dataCheckString))
	calculatedHash := hex.EncodeToString(check.Sum(nil))
	if !hmac.Equal([]byte(calculatedHash), []byte(hash)) {
		return nil, errors.New("Подпись Telegram не прошла проверку")
	}

	authDateRaw := values.Get("auth_date")
	if authDateRaw != "" {
		authDateUnix, err := strconv.ParseInt(authDateRaw, 10, 64)
		if err == nil && time.Since(time.Unix(authDateUnix, 0)) > 24*time.Hour {
			return nil, errors.New("Данные Telegram устарели")
		}
	}

	userRaw := values.Get("user")
	if userRaw == "" {
		return nil, errors.New("Пользователь Telegram не передан")
	}

	var user TelegramUser
	if err := json.Unmarshal([]byte(userRaw), &user); err != nil {
		return nil, errors.New("Не удалось прочитать пользователя Telegram")
	}
	if user.ID == 0 {
		return nil, errors.New("Некорректный Telegram ID")
	}
	return &user, nil
}
