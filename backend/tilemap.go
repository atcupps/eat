package main

import (
	"fmt"
	"math"
	"sync"

	"github.com/ojrac/opensimplex-go"
)

const (
	MAP_WIDTH       int     = 192
	MAP_HEIGHT      int     = 128
	PIXELS_PER_TILE int     = 20
	MAP_PIXELS_X    int     = MAP_WIDTH * PIXELS_PER_TILE
	MAP_PIXELS_Y    int     = MAP_HEIGHT * PIXELS_PER_TILE
	X_SCALE         float64 = 1.3 // smaller = zoomed in, larger = zoomed out
	Y_SCALE         float64 = float64(MAP_WIDTH) / float64(MAP_HEIGHT) * X_SCALE

	MIN_ELEVATION float64 = -1.0
	MAX_ELEVATION float64 = 1.0

	DEEP_WATER_THRESHOLD    float64 = -0.3
	SHALLOW_WATER_THRESHOLD float64 = 0
	BEACH_THRESHOLD                 = 0.05
	VEGETATION_THRESHOLD            = 0.65
	HILLS_THRESHOLD                 = 0.75

	MIN_NUTRITION float64 = 0.0
	MAX_NUTRITION float64 = 1.0
)

type TileType int

const (
	TileTypeDeepWater TileType = iota
	TileTypeShallowWater
	TileTypeBeach
	TileTypeVegetation
	TileTypeHills
	TileTypeMountain
)

func tileTypeFromElevation(elevation float64) TileType {
	if elevation < DEEP_WATER_THRESHOLD {
		return TileTypeDeepWater
	} else if elevation < SHALLOW_WATER_THRESHOLD {
		return TileTypeShallowWater
	} else if elevation < BEACH_THRESHOLD {
		return TileTypeBeach
	} else if elevation < VEGETATION_THRESHOLD {
		return TileTypeVegetation
	} else if elevation < HILLS_THRESHOLD {
		return TileTypeHills
	} else {
		return TileTypeMountain
	}
}

type TileMap struct {
	elevation [][]float64
	nutrition [][]float64
	Lock      sync.RWMutex
}

func tileableNoise(x, y, width, height float64, noise *opensimplex.Noise) float64 {
	angleX := (x / width) * 2 * math.Pi
	angleY := (y / height) * 2 * math.Pi

	nx := math.Cos(angleX) * X_SCALE
	ny := math.Sin(angleX) * Y_SCALE
	nz := math.Cos(angleY) * X_SCALE
	nw := math.Sin(angleY) * Y_SCALE

	return (*noise).Eval4(nx, ny, nz, nw)
}

func NewTileMap(seed int64) TileMap {
	noise := opensimplex.New(seed)
	elevation := make([][]float64, MAP_HEIGHT)
	width := float64(MAP_WIDTH)
	height := float64(MAP_HEIGHT)
	for y := range elevation {
		elevation[y] = make([]float64, MAP_WIDTH)
		for x := range elevation[y] {
			elevation[y][x] = tileableNoise(float64(x), float64(y), width, height, &noise)
		}
	}

	nutrition := make([][]float64, MAP_HEIGHT)
	for y := range nutrition {
		nutrition[y] = make([]float64, MAP_WIDTH)
		for x := range nutrition[y] {
			if tileTypeFromElevation(elevation[y][x]) == TileTypeVegetation {
				nutrition[y][x] = 1.0 - (elevation[y][x]-BEACH_THRESHOLD)/(VEGETATION_THRESHOLD-BEACH_THRESHOLD)
			} else {
				nutrition[y][x] = MIN_NUTRITION
			}
		}
	}

	return TileMap{
		elevation: elevation,
		nutrition: nutrition,
		Lock:      sync.RWMutex{},
	}
}

func (tm *TileMap) GetElevation(x, y int) (float64, error) {
	if x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT {
		return 0, fmt.Errorf("tile at (%d, %d) is out of bounds", x, y)
	}
	tm.Lock.RLock()
	defer tm.Lock.RUnlock()
	return tm.elevation[y][x], nil
}

func (tm *TileMap) GetNutrition(x, y int) (float64, error) {
	if x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT {
		return 0, fmt.Errorf("tile at (%d, %d) is out of bounds", x, y)
	}
	tm.Lock.RLock()
	defer tm.Lock.RUnlock()
	return tm.nutrition[y][x], nil
}

func (tm *TileMap) GetTileType(x, y int) (TileType, error) {
	elevation, err := tm.GetElevation(x, y)
	if err != nil {
		return TileTypeDeepWater, err
	}
	return tileTypeFromElevation(elevation), nil
}

func (tm *TileMap) InitMessage() InitMessage {
	return InitMessage{
		Elevation: tm.elevation,
		Nutrition: tm.nutrition,
	}
}
