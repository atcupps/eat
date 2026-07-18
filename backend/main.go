package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/ojrac/opensimplex-go"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}

var tileMapMutex sync.RWMutex

const (
	mapWidth  = 190
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

	go func() {
		ticker := time.NewTicker(50 * time.Millisecond)
		defer ticker.Stop()
		for range ticker.C {
			tileMapMutex.Lock()
			tileMap[0][0] += 0.01
			if tileMap[0][0] > 1.0 {
				tileMap[0][0] -= 2.0
			}
			tileMapMutex.Unlock()
		}
	}()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade error:", err)
			return
		}
		defer conn.Close()

		ticker := time.NewTicker(50 * time.Millisecond)
		defer ticker.Stop()

		for range ticker.C {
			tileMapMutex.RLock()
			err := conn.WriteJSON(tileMap)
			tileMapMutex.RUnlock()
			if err != nil {
				log.Println("write error:", err)
				break
			}
		}
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
