package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kevinanielsen/go-fast-cdn/src/database"
)

type ConfigHandler struct {
	configRepo *database.ConfigRepo
}

func NewConfigHandler(configRepo *database.ConfigRepo) *ConfigHandler {
	return &ConfigHandler{configRepo: configRepo}
}

// GetRegistrationEnabled returns whether registration is enabled
func (h *ConfigHandler) GetRegistrationEnabled(c *gin.Context) {
	val, err := h.configRepo.Get("registration_enabled")
	if err != nil || val == "" {
		c.JSON(http.StatusOK, gin.H{"enabled": true}) // default: enabled
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": val == "true"})
}

// SetRegistrationEnabled sets registration enabled/disabled
func (h *ConfigHandler) SetRegistrationEnabled(c *gin.Context) {
	type req struct {
		Enabled bool `json:"enabled"`
	}
	var body req
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	val := "false"
	if body.Enabled {
		val = "true"
	}
	if err := h.configRepo.Set("registration_enabled", val); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": body.Enabled})
}

// SetAccessTokenTTL sets the access_token_ttl setting
func (h *ConfigHandler) SetAccessTokenTTL(c *gin.Context) {
	type req struct {
		AccessTokenTTL int `json:"access_token_ttl"` // in minutes
	}

	var body req
	const (
    	MinAccessTokenTTL = 5    // 5 minutes
   	 	MaxAccessTokenTTL = 1440  // 24 hours
	)

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if body.AccessTokenTTL < MinAccessTokenTTL || body.AccessTokenTTL > MaxAccessTokenTTL {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: access_token_ttl must be between 5 and 1440 minutes"})
		return
	}

	if err := h.configRepo.Set("access_token_ttl", strconv.Itoa(body.AccessTokenTTL)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ttl": body.AccessTokenTTL})
}

// GetAccessTokenTTL returns the access token TTL 
func (h *ConfigHandler) GetAccessTokenTTL(c *gin.Context) {
	val, err := h.configRepo.Get("access_token_ttl")
	if err != nil || val == "" {
		c.JSON(http.StatusOK, gin.H{"ttl": 15}) // default: 15 minutes
		return
	}
	ttl, err := strconv.Atoi(val)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"ttl": 15}) // default: 15 minutes
		return
	}
	c.JSON(http.StatusOK, gin.H{"ttl": ttl})
}