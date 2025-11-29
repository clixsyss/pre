import UIKit
import Capacitor
import FirebaseCore
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()
        print("📱 AppDelegate: Firebase configured")
        
        // Set notification delegate to enable sound and presentation
        UNUserNotificationCenter.current().delegate = self
        
        // Clear badge when app opens
        UIApplication.shared.applicationIconBadgeNumber = 0
        
        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        print("✅ AppDelegate: Registered for remote notifications")
        print("✅ AppDelegate: Device token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
        
        // Let Capacitor handle the token
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("❌ AppDelegate: Failed to register for remote notifications")
        print("❌ AppDelegate: Error: \(error.localizedDescription)")
        
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable : Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        print("📬 AppDelegate: Received remote notification")
        
        NotificationCenter.default.post(
            name: Notification.Name("didReceiveRemoteNotification"),
            object: completionHandler,
            userInfo: userInfo
        )
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive.
        // Clear badge when app becomes active
        UIApplication.shared.applicationIconBadgeNumber = 0
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url.
        
        // If this is a guest-pass URL or firebaseapp.com, open it in Safari instead of the app
        if url.absoluteString.contains("/guest-pass/") || url.host?.contains("firebaseapp.com") == true {
            print("🔗 Guest pass link detected - opening in Safari instead of app")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            return true
        }
        
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        
        // If this is a guest-pass URL or firebaseapp.com, open it in Safari instead of the app
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL,
           (url.absoluteString.contains("/guest-pass/") || url.host?.contains("firebaseapp.com") == true) {
            print("🔗 Guest pass link detected - opening in Safari instead of app")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            return true
        }
        
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    // Handle notifications when app is in foreground - enables sound, badge, and banner
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        print("🔔 AppDelegate: Will present notification in foreground")
        
        // Show banner, play sound, and update badge even when app is in foreground
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        print("👆 AppDelegate: User tapped notification")
        
        // Let Capacitor handle the notification response
        NotificationCenter.default.post(
            name: NSNotification.Name("CAPNotificationDidReceiveResponse"),
            object: response
        )
        
        completionHandler()
    }
}
