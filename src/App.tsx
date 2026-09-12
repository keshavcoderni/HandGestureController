import React from "react";
import { 
  Smartphone, 
  Layers, 
  Camera, 
  ShieldCheck, 
  FileCode2, 
  Settings2, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  Terminal
} from "lucide-react";

export default function App() {
  const androidFiles = [
    { path: "settings.gradle.kts", desc: "Gradle root project configuration & repositories" },
    { path: "build.gradle.kts", desc: "Root build script (AGP 9.1.1, Kotlin 2.1.0)" },
    { path: "gradle.properties", desc: "JVM memory allocation & AndroidX flags" },
    { path: "gradle/wrapper/gradle-wrapper.properties", desc: "Gradle 9.3.1 wrapper config" },
    { path: "app/build.gradle.kts", desc: "Module build script (SDK 35, Jetpack Compose, CameraX)" },
    { path: "app/src/main/AndroidManifest.xml", desc: "Camera, Overlay, & Accessibility permissions" },
    { path: "app/src/main/java/com/gesture/controller/MainActivity.kt", desc: "Jetpack Compose UI & Service controller" },
    { path: "app/src/main/java/com/gesture/controller/gesture/Gesture.kt", desc: "Gesture enums & 3D landmark models" },
    { path: "app/src/main/java/com/gesture/controller/gesture/GestureAnalyzer.kt", desc: "MediaPipe Euclidean gesture analyzer" },
    { path: "app/src/main/java/com/gesture/controller/gesture/ProximityDetector.kt", desc: "Touchless wake/sleep detector" },
    { path: "app/src/main/java/com/gesture/controller/gesture/HandGestureController.kt", desc: "CameraX pipeline & gesture dispatcher" },
    { path: "app/src/main/java/com/gesture/controller/overlay/CursorPreferences.kt", desc: "SharedPreferences cursor persistence" },
    { path: "app/src/main/java/com/gesture/controller/overlay/GestureOverlayService.kt", desc: "System Alert Window floating cursor service" },
    { path: "app/src/main/java/com/gesture/controller/service/GestureAccessibilityService.kt", desc: "Accessibility Service (Home, Back, Tap, Scroll)" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="w-6 h-6" />
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Hand Gesture Controller (Android Native)
              </h1>
            </div>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Native Android project built with Kotlin 2.1.0, Jetpack Compose Material 3, Android SDK 35, 
              CameraX, and Android Accessibility Service for touchless phone navigation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Native Android Ready
            </span>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Runtime Architecture
            </div>
            <div className="text-lg font-bold text-white">Android SDK 35</div>
            <div className="text-xs text-slate-400 mt-1">Kotlin 2.1.0 • AGP 9.1.1</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              Vision & Tracking
            </div>
            <div className="text-lg font-bold text-white">CameraX + MediaPipe</div>
            <div className="text-xs text-slate-400 mt-1">21 Hand Landmarks • 3D Vectors</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              System Services
            </div>
            <div className="text-lg font-bold text-white">Accessibility + Overlay</div>
            <div className="text-xs text-slate-400 mt-1">Home, Back, Recents, Tap, Scroll</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              UI Framework
            </div>
            <div className="text-lg font-bold text-white">Jetpack Compose M3</div>
            <div className="text-xs text-slate-400 mt-1">Live Preview & Preferences</div>
          </div>
        </div>

        {/* Project Files List */}
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white text-sm md:text-base">
                Active Android Project Structure
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Root Project Layout
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {androidFiles.map((file, idx) => (
              <div key={idx} className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-800/30 transition-colors">
                <div className="font-mono text-sm text-sky-300 font-medium">
                  {file.path}
                </div>
                <div className="text-xs text-slate-400">
                  {file.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build & GitHub Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Building in Android Studio
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Open <strong>Android Studio</strong> (Ladybug / Iguana or later).</li>
              <li>Click <strong>Open Project</strong> and select this root directory.</li>
              <li>Android Studio automatically detects <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">settings.gradle.kts</code>.</li>
              <li>Sync Gradle and run the <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">:app</code> module on your physical Android device.</li>
            </ol>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              Export to GitHub
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All unused web conversion and simulator files have been purged. Only the genuine Android Kotlin code, manifests, Gradle configurations, and resources are maintained.
            </p>
            <div className="text-xs text-slate-400">
              Click <strong>Export / Settings</strong> in the top-right header and select <strong>Export to GitHub</strong> to commit directly to your repository.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
