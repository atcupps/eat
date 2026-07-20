package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func ServeInitConnections() {
	http.HandleFunc("/init", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		State.Tiles.Lock.RLock()
		msg := State.InitMessage()
		State.Tiles.Lock.RUnlock()

		if err := json.NewEncoder(w).Encode(msg); err != nil {
			log.Println("write error:", err)
		}
	})
}

func StreamSim(stop <-chan bool) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade error:", err)
			return
		}
		defer conn.Close()

		ticker := time.NewTicker(50 * time.Millisecond)
		defer ticker.Stop()

		for range ticker.C {
			State.Tiles.Lock.RLock()
			err := conn.WriteJSON(State.TickMessage())
			State.Tiles.Lock.RUnlock()
			if err != nil {
				log.Println("write error:", err)
				break
			}
		}
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
