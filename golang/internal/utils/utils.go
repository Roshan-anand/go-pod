package utils

import (
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"io"
	"math/rand"
)

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

// to decompress the sdp data
func DecompressD(data string) (string, error) {
	bin, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return "", err
	}

	reader, err := gzip.NewReader(bytes.NewReader(bin))
	if err != nil {
		return "", err
	}
	defer reader.Close()

	var decmpSdp bytes.Buffer
	_, err = io.Copy(&decmpSdp, reader)
	if err != nil {
		return "", err
	}

	return decmpSdp.String(), nil
}

func CompressD(data *string) (string, error) {

	var buf bytes.Buffer

	wr := gzip.NewWriter(&buf)
	_, err := wr.Write([]byte(*data))

	wr.Flush()
	wr.Close()

	if err != nil {
		return "", err
	}
	if err := wr.Close(); err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}
