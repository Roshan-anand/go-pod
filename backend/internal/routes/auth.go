package routes

import (
	"encoding/json"
	"net/http"

	"github.com/Roshan-anand/go-pod/internal/utils"
)

func getUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	name, email, err := utils.VerifyJwtToken(cookie.Value)
	if err != nil {
		http.Error(w, "Invalid JWT token", http.StatusUnauthorized)
		return
	}

	userData := map[string]string{
		"name":  name,
		"email": email,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userData)
	if err != nil {
		http.Error(w, "Failed to encode user data", http.StatusInternalServerError)
		return
	}
}

func login(w http.ResponseWriter, r *http.Request) {
	var data map[string]string
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	name := data["name"]
	email := data["email"]

	cookie, err := utils.GenerateJwtToken(name, email)
	if err != nil {
		http.Error(w, "Failed to generate JWT token", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
}

func AuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /auth/user", getUser)
	mux.HandleFunc("POST /auth/login", login)
}
