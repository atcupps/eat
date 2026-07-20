package main

import (
	"log"
	"net/http"
	"time"
)

func ServeInitConnections() {
	http.HandleFunc("/init", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade error:", err)
			return
		}
		defer conn.Close()

		State.Tiles.Lock.RLock()
		err = conn.WriteJSON(State.InitMessage())
		State.Tiles.Lock.RUnlock()
		if err != nil {
			log.Println("write error:", err)
		}
	})
}

func StreamSim(stop <-chan bool) {
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
