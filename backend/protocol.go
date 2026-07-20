package main

type InitMessage struct {
	Width     int         `json:"width"`
	Height    int         `json:"height"`
	Scale     float64     `json:"scale"`
	Elevation [][]float64 `json:"elevation"`
	Nutrition [][]float64 `json:"nutrition"`
}

type TickMessage struct {
	Nutrition [][]float64 `json:"nutrition"`
}
