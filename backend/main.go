package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ojrac/opensimplex-go"
)

const (
	mapWidth  = 160
	mapHeight = 120

	// Scale controls the "zoom" level of the noise.
	// Smaller values = zoomed in (larger islands, smoother transitions)
	// Larger values = zoomed out (chaotic, noisy terrain)
	scale = 0.04
)

func main() {
	// Initialize the noise generator with a random seed based on current time
	seed := time.Now().UnixNano()
	noise := opensimplex.New(seed)

	fmt.Println("Generating Procedural Tile Map...")

	tileMap := make([][]float64, mapHeight)

	// Loop through the grid
	for y := range tileMap {
		tileMap[y] = make([]float64, mapWidth)
		for x := range tileMap[y] {
			// Multiply coordinates by the scale factor
			nx := float64(x) * scale
			ny := float64(y) * scale

			// Get the noise value at this coordinate.
			// Eval2 returns a value roughly between -1.0 and 1.0
			val := noise.Eval2(nx, ny)
			tileMap[y][x] = val
		}
	}

	fmt.Println("Map generated! Starting web server on :8080...")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		err := json.NewEncoder(w).Encode(tileMap)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
