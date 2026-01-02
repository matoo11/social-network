package logs

import (
	"fmt"
	"log"
	"os"
)

var (
	logFile       *os.File
	termLogger    *log.Logger
	fileLogger    *log.Logger
	logToTerminal bool = true
	logToFile     bool = true
)

const callerDepth = 2 // Skip 2 frames: Output() -> LogInfo/LogError/etc. -> actual caller
const responseCallerDepth = 3 // Skip 3 frames: Output() -> LogResponse() -> caller -> actual caller

func InitializeLogger(logFilePath string) error {
	var err error
	logFile, err = os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}

	termLogger = log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile)
	fileLogger = log.New(logFile, "", log.LstdFlags|log.Lshortfile)

	return nil
}

// LogInfo logs an informational message with file and line number.
// Supports format strings: LogInfo("user %s connected", username)
func LogInfo(format string, args ...any) {
    message := formatMessage(format, args...)
    if logToTerminal {
        termLogger.Output(callerDepth, fmt.Sprintf("%s %s", Blue("[INFO]"), message))
    }
    if logToFile {
        fileLogger.Output(callerDepth, fmt.Sprintf("[INFO] %s", message))
    }
}

// LogError logs an error message with file and line number.
// Supports format strings: LogError("failed to connect: %v", err)
func LogError(format string, args ...any) {
    message := formatMessage(format, args...)
    if logToTerminal {
        termLogger.Output(callerDepth, fmt.Sprintf("%s %s", Red("[ERROR]"), message))
    }
    if logToFile {
        fileLogger.Output(callerDepth, fmt.Sprintf("[ERROR] %s", message))
    }
}

// LogWarn logs a warning message with file and line number.
// Supports format strings: LogWarn("connection unstable for user %s", username)
func LogWarn(format string, args ...any) {
    message := formatMessage(format, args...)
    if logToTerminal {
        termLogger.Output(callerDepth, fmt.Sprintf("%s %s", Yellow("[WARN]"), message))
    }
    if logToFile {
        fileLogger.Output(callerDepth, fmt.Sprintf("[WARN] %s", message))
    }
}

// LogDebug logs a debug message with file and line number (useful during development).
// Supports format strings: LogDebug("processing request %d", requestID)
func LogDebug(format string, args ...any) {
    message := formatMessage(format, args...)
    if logToTerminal {
        termLogger.Output(callerDepth, fmt.Sprintf("%s %s", Magenta("[DEBUG]"), message))
    }
    if logToFile {
        fileLogger.Output(callerDepth, fmt.Sprintf("[DEBUG] %s", message))
    }
}

// LogResponse logs HTTP response information with file and line number.
func LogResponse(method string, url string, code int, message string, dataBytes []byte) {
    if logToTerminal {
        termLogger.Output(responseCallerDepth, fmt.Sprintf("%s%s", Green("[RESPONSE]"), CreateResponseLogLine(method, url, code, message, dataBytes, true)))
    }
    if logToFile {
        fileLogger.Output(responseCallerDepth, fmt.Sprintf("[RESPONSE]%s", CreateResponseLogLine(method, url, code, message, dataBytes, false)))
    }
}

func CloseLogger() {
	if logFile != nil {
		logFile.Close()
	}
}

// ============================================================
//                    Helper Functions
// ============================================================

// formatMessage formats a message with optional arguments.
// If no args provided, returns format as-is (for backward compatibility).
func formatMessage(format string, args ...any) string {
    if len(args) == 0 {
        return format
    }
    return fmt.Sprintf(format, args...)
}

func CreateResponseLogLine(method string, url string, code int, message string, dataBytes []byte, useColors bool) string {
	codeStr := fmt.Sprintf("%d", code)
	msg := message
	methodStr := method
	urlStr := url
	data := string(dataBytes)

	sep := " | "
	colon := ": "
	quote := "\""

	if useColors {
		methodStr = Blue(method)
		urlStr = Cyan(url)
		codeStr = Yellow(codeStr)
		msg = Orange(message)
		data = Magenta("-----") // Magenta(data)

		sep = Grey(" | ")
		colon = Grey(": ")
		quote = Grey("\"")
	}

	// var prettyData bytes.Buffer
	// if err := json.Indent(&prettyData, dataBytes, "", "  "); err == nil {
	// 	data = prettyData.String()
	// } else {
	// 	data = string(dataBytes)
	// }

	// if useColors {
	// 	data = Magenta(data)
	// }

	logLine := ""
	logLine += sep + "Method" + colon + quote + methodStr + quote
	logLine += sep + "URL" + colon + quote + urlStr + quote
	logLine += sep + "Code" + colon + codeStr
	logLine += sep + "Message" + colon + quote + msg + quote
	logLine += sep + "Data" + colon + data

	return logLine

}
