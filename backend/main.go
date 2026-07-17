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
	mapWidth  = 60
	mapHeight = 20

	// Scale controls the "zoom" level of the noise.
	// Smaller values = zoomed in (larger islands, smoother transitions)
	// Larger values = zoomed out (chaotic, noisy terrain)
	scale = 0.08
)

// getTile maps a continuous noise value (roughly -1.0 to 1.0) to a discrete tile.
func getTile(noiseValue float64) string {
	switch {
	case noiseValue < -0.3:
		return "#" // Deep Water
	case noiseValue < -0.1:
		return "*" // Shallow Water
	case noiseValue < 0.05:
		return "=" // Sand (Beach)
	case noiseValue < 0.4:
		return "-" // Grass
	case noiseValue < 0.65:
		return ":" // Forest
	default:
		return "." // Mountain / Snow
	}
}

func main() {
	// Initialize the noise generator with a random seed based on current time
	seed := time.Now().UnixNano()
	noise := opensimplex.New(seed)

	fmt.Println("Generating Procedural Tile Map...")

	tileMap := make([][]string, mapHeight)
	
	// Loop through the grid
	for y := 0; y < mapHeight; y++ {
		tileMap[y] = make([]string, mapWidth)
		for x := 0; x < mapWidth; x++ {
			// Multiply coordinates by the scale factor
			nx := float64(x) * scale
			ny := float64(y) * scale

			// Get the noise value at this coordinate.
			// Eval2 returns a value roughly between -1.0 and 1.0
			val := noise.Eval2(nx, ny)

			// Convert the raw noise value to a visual tile
			tileMap[y][x] = getTile(val)
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
