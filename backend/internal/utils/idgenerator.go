package utils

import "math/rand"

// to generate a random string of given length
// it is used to gerate unique ID's
// more the ct more the unique ID's
func GenerateID(ct int) string {
	combo := "qwertyuioplkhgfdsazxcvbnmPOIUYTREWQASDFGHJKLMNBVCXZ1234567890"
	id := ""
	for i := 0; i < ct; i++ {
		idx := rand.Intn(len(combo))
		id += string(combo[idx])
	}
	return id
}
