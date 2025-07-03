package utils

import (
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"io"
)

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

// to compress the sdp data
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
