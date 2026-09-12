# Hand Gesture Controller

Touchless gesture controller with real-time hand tracking, customizable floating cursor, and phone action executor.

## Native Android Project (`android/`)

The native Android project is in the `android/` directory:

- **Build System**: Gradle 9.3.1 + Android Gradle Plugin (AGP) 9.1.1 + Kotlin 2.1.0 + Java 21
- **UI Framework**: Jetpack Compose with Material 3 (`MainActivity.kt`)
- **Accessibility Service (`service/GestureAccessibilityService.kt`)**: Executes system global actions (`GLOBAL_ACTION_HOME`, `GLOBAL_ACTION_BACK`, `GLOBAL_ACTION_RECENTS`) and dispatches touch taps and scrolls via `dispatchGesture`.
- **System Overlay (`overlay/GestureOverlayService.kt`)**: Foreground service using `TYPE_APPLICATION_OVERLAY` to draw the customized floating cursor across any running application.
- **Vision Pipeline (`gesture/HandGestureController.kt`, `gesture/GestureAnalyzer.kt`)**: MediaPipe Hands 21-landmark tracking, Euclidean distance analysis, circular frame history, and gesture classification.
- **Preferences (`overlay/CursorPreferences.kt`)**: SharedPreferences persistence for cursor size, style, color, and alpha.

### To open and build in Android Studio:
1. Open Android Studio.
2. Select **Open** and choose the `android` folder (or root if using Gradle multi-project).
3. Build or run the `app` configuration on your Android device.

## Web Edition & Simulator

The root directory contains an interactive web edition allowing touchless cursor testing, gesture verification, and real-time camera tracking directly in the browser.
