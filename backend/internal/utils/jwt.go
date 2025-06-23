package utils

import (
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

// to generate jwt token
func GenerateJwtToken(name string, email string) (*http.Cookie, error) {

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"name": name, "email": email})

	secret := os.Getenv("JWT_SECRET_KEY")
	signedToken, err := jwtToken.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	//expire after 1 month
	cookie := &http.Cookie{
		Name:    "jwt",
		Value:   signedToken,
		Expires: time.Now().Add(30 * 24 * time.Hour),
	}

	return cookie, nil
}

// to parse verify jwt token
func VerifyJwtToken(token string) (string, string, error) {
	secret := os.Getenv("JWT_SECRET_KEY")

	jwtToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return "", "", err
	}

	if claims, ok := jwtToken.Claims.(jwt.MapClaims); ok && jwtToken.Valid {
		email := claims["email"].(string)
		name := claims["name"].(string)
		return name, email, nil
	}
	return "", "", nil
}
