# Hand Gesture Controller (Web / React Edition)

A web-based rewrite of the Android **Hand Gesture Controller**, providing touchless cursor control, real-time hand landmark tracking, and gesture action execution.

## Features

- **Setup & Appearance Customization**:
  - Size slider (20px to 150px)
  - Transparency slider (10% to 100%)
  - Cursor styles: `CIRCLE`, `SQUARE`, `RING`, `DOT`
  - Color themes: Red, Blue, Green, Yellow, Magenta, Cyan
  - Real-time Cursor Preview
  - System Permission state manager (Camera, Overlay, Battery, Accessibility Service)
  - Persistent settings via LocalStorage (`CursorPreferences`)

- **Vision Pipeline & Gesture Recognition**:
  - Web Camera integration with mirrored front camera feed
  - MediaPipe Hands 21-keypoint skeleton tracking
  - Continuous palm and fingertip proximity detection
  - Instant Testbed Simulator for testing gestures without webcam

- **Core Gesture Actions (`GestureAnalyzer.kt` business logic)**:
  - **Fist**: Home Button
  - **Open Palm**: Back Button
  - **Point Index**: Touchless Cursor steering
  - **Pinch**: Tap / Click
  - **Slide Up / Down**: Scroll Up / Down
  - **Wave Left / Right**: Swipe Navigation / App Switch
  - **Thumbs Up**: Volume Up

- **Interactive Device Simulator**:
  - Simulated target screen displaying how actions (Home, Back, Recents, Scroll, Tap, Volume) execute seamlessly
  - Optional Fullscreen Overlay mode for touchless cursor navigation across the entire web interface
