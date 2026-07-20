package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}

var State SimState

func main() {
	fmt.Println("Starting simulation...")

	State = NewSim()

	fmt.Println("Map generated. Beginning update thread...")

	simDone := make(chan bool)
	go State.Run(simDone)

	fmt.Println("Update thread initialized. Starting server at port :8080...")

	ServeInitConnections()
	StreamSim(simDone)
}
