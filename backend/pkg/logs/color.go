package logs

const (
	colorReset        = "\033[0m"
	colorRed          = "\033[31m"
	colorGreen        = "\033[32m"
	colorYellow       = "\033[33m"
	colorBlue         = "\033[34m"
	colorMagenta      = "\033[35m"
	colorCyan         = "\033[36m"
	colorWhite        = "\033[37m"
	colorBrightYellow = "\033[93m"
	colorOrange       = "\033[38;5;208m"
	colorGrey         = "\033[90m"
)

func Red(text string) string          { return colorRed + text + colorReset }
func Green(text string) string        { return colorGreen + text + colorReset }
func Yellow(text string) string       { return colorYellow + text + colorReset }
func Blue(text string) string         { return colorBlue + text + colorReset }
func Magenta(text string) string      { return colorMagenta + text + colorReset }
func Cyan(text string) string         { return colorCyan + text + colorReset }
func White(text string) string        { return colorWhite + text + colorReset }
func BrightYellow(text string) string { return colorBrightYellow + text + colorReset }
func Orange(text string) string       { return colorOrange + text + colorReset }
func Grey(text string) string         { return colorGrey + text + colorReset }

