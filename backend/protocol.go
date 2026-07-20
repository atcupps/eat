package main

type InitMessage struct {
	Elevation [][]float64 `json:"elevation"`
	Nutrition [][]float64 `json:"nutrition"`
}

type TickMessage struct {
	Nutrition [][]float64 `json:"nutrition"`
}
