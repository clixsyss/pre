import Foundation
import AppIntents

@available(iOS 16.0, *)
struct OpenGateAppIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Gate"
    static var description = IntentDescription("Quickly open the gate from Shortcuts, Siri, or widgets.")
    static var openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        guard let url = URL(string: "pregroupapp://open-gate?source=ios-app-intent") else {
            return .result()
        }
        return .result(opensIntent: OpenURLIntent(url))
    }
}

@available(iOS 16.0, *)
struct OpenGateAppShortcutsProvider: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        [
            AppShortcut(
                intent: OpenGateAppIntent(),
                phrases: [
                    "Open Gate in \(.applicationName)",
                    "Gate Access in \(.applicationName)",
                ],
                shortTitle: "Open Gate",
                systemImageName: "lock.open"
            )
        ]
    }
}
