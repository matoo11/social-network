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
	logToTerminal bool = false
	logToFile     bool = false
)

func InitializeLogger(logFilePath string) error {
	var err error
	logFile, err = os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}

	termLogger = log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile)
	fileLogger = log.New(logFile, "", log.LstdFlags|log.Lshortfile)

	// logToTerminal = true
	// logToFile = true

	return nil
}

func LogInfo(message string) {
	if logToTerminal {
		termLogger.Printf("%s %s\n", Blue("[INFO]"), message)
	}
	if logToFile {
		fileLogger.Printf("[INFO] %s\n", message)
	}
}

func LogError(message string) {
	if logToTerminal {
		termLogger.Printf("%s %s\n", Red("[ERROR]"), message)
	}
	if logToFile {
		fileLogger.Printf("[ERROR] %s\n", message)
	}
}

func LogResponse(method string, url string, code int, message string, dataBytes []byte) {
	if logToTerminal {
		termLogger.Printf("%s%s\n", Green("[RESPONSE]"), CreateResponseLogLine(method, url, code, message, dataBytes, true))
	}
	if logToFile {
		fileLogger.Printf("[RESPONSE]%s\n", CreateResponseLogLine(method, url, code, message, dataBytes, false))
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
