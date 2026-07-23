package main

import (
	"fmt"
	"time"
)

const (
	SIM_TICK_RATE = 100 * time.Millisecond
)

type SimState struct {
	Tiles TileMap
	// Blobs []Blob
}

func NewSim() SimState {
	seed := int64(time.Now().UnixNano())
	return SimState{
		Tiles: NewTileMap(seed),
	}
}

func (s *SimState) tick() error {
	// do nothing for now
	return nil
}

func (s *SimState) Run(done chan<- bool) {
	ticker := time.NewTicker(SIM_TICK_RATE)
	defer ticker.Stop()

	for range ticker.C {
		err := s.tick()
		if err != nil {
			fmt.Printf("Simulation tick failed: %s\n", err.Error())
			done <- true
			return
		}
	}
	done <- true
}

func (s *SimState) InitMessage() InitMessage {
	return s.Tiles.InitMessage()
}

func (s *SimState) TickMessage() TickMessage {
	return TickMessage{
		Nutrition: s.Tiles.nutrition,
	}
}
