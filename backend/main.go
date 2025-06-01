package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required,min=1,max=1000"`
}

type ChatResponse struct {
	Response string `json:"response"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: GEMINI_API_KEY environment variable is required")
		os.Exit(1)
	}

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	router.POST("/api/chat", handleChat)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	router.Run(":" + port)
}

func handleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request format or message too long"})
		return
	}

	req.Message = strings.TrimSpace(req.Message)
	if req.Message == "" {
		fmt.Printf("Empty message received\n")
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Message cannot be empty"})
		return
	}

	fmt.Printf("Processing message: %s\n", req.Message)

	response, err := callGeminiAPI(req.Message)
	if err != nil {
		fmt.Printf("API Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to get AI response"})
		return
	}

	fmt.Printf("API response received successfully\n")
	c.JSON(http.StatusOK, ChatResponse{Response: response})
}

func callGeminiAPI(message string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("API key not configured")
	}

	fmt.Printf("Calling Gemini API with message length: %d\n", len(message))

	ctx := context.Background()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		fmt.Printf("Failed to create Gemini client: %v\n", err)
		return "", fmt.Errorf("failed to create client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	fmt.Printf("Sending request to Gemini API...\n")
	resp, err := model.GenerateContent(ctx, genai.Text(message))
	if err != nil {
		fmt.Printf("Gemini API request failed: %v\n", err)
		return "", fmt.Errorf("failed to generate content: %v", err)
	}

	if len(resp.Candidates) == 0 ||
		len(resp.Candidates[0].Content.Parts) == 0 {
		fmt.Printf("Empty response from Gemini API\n")
		return "", fmt.Errorf("no response from AI")
	}

	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	fmt.Printf("Gemini API response length: %d\n", len(responseText))
	return responseText, nil
}
