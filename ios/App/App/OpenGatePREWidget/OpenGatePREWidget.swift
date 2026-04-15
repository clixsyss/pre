import WidgetKit
import SwiftUI

struct OpenGatePREProvider: TimelineProvider {
    func placeholder(in context: Context) -> OpenGatePREEntry {
        OpenGatePREEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (OpenGatePREEntry) -> Void) {
        completion(OpenGatePREEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<OpenGatePREEntry>) -> Void) {
        let entry = OpenGatePREEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
}

struct OpenGatePREEntry: TimelineEntry {
    let date: Date
}

struct OpenGatePREWidgetEntryView: View {
    var entry: OpenGatePREProvider.Entry
    @Environment(\.widgetFamily) private var family

    private let openGateURL = URL(string: "pregroupapp://open-gate?source=ios-widget")!

    var body: some View {
        Link(destination: openGateURL) {
            contentView
        }
        .widgetURL(openGateURL)
    }

    @ViewBuilder
    private var contentView: some View {
        switch family {
        case .accessoryInline:
            Label("Tap to Open", systemImage: "lock.open.fill")
        case .accessoryCircular:
            ZStack {
                Circle()
                    .fill(Color(red: 35 / 255, green: 31 / 255, blue: 32 / 255))
                Circle()
                    .stroke(Color(red: 175 / 255, green: 30 / 255, blue: 35 / 255), lineWidth: 2)
                    .padding(3)
                Image(systemName: "lock.open.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
            }
        case .accessoryRectangular:
            HStack(spacing: 10) {
                Image(systemName: "lock.open.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(red: 175 / 255, green: 30 / 255, blue: 35 / 255))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Open Gate")
                        .font(.system(size: 13, weight: .semibold))
                    Text("Tap to Open")
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(.secondary)
                }
                Spacer(minLength: 0)
            }
        default:
            homeWidgetCard
        }
    }

    private var homeWidgetGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(red: 35 / 255, green: 31 / 255, blue: 32 / 255),   // #231F20
                Color(red: 70 / 255, green: 20 / 255, blue: 24 / 255),   // deep red-black
                Color(red: 175 / 255, green: 30 / 255, blue: 35 / 255)   // #AF1E23
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private var homeWidgetForeground: some View {
        ZStack(alignment: .bottomLeading) {
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 150, height: 150)
                .offset(x: 62, y: -74)

            Circle()
                .fill(Color(red: 175 / 255, green: 30 / 255, blue: 35 / 255).opacity(0.28))
                .frame(width: 120, height: 120)
                .offset(x: -34, y: 55)

            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.25),
                                        Color(red: 175 / 255, green: 30 / 255, blue: 35 / 255).opacity(0.45)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 40, height: 40)
                        Image(systemName: "lock.open.fill")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                    }
                    Spacer(minLength: 0)
                }

                Text("Tap to Open")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)

                Text("Gate Access")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Color.white.opacity(0.85))
            }
            .padding(14)
        }
    }

    @ViewBuilder
    private var homeWidgetCard: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            homeWidgetForeground
                .containerBackground(for: .widget) {
                    homeWidgetGradient
                }
        } else {
            homeWidgetForeground
                .background(homeWidgetGradient)
        }
    }
}

struct OpenGatePREWidget: Widget {
    let kind: String = "OpenGatePREWidget"

    var body: some WidgetConfiguration {
        let configuration = StaticConfiguration(kind: kind, provider: OpenGatePREProvider()) { entry in
            OpenGatePREWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Open Gate")
        .description("Tap to open your gate quickly.")

        if #available(iOSApplicationExtension 16.0, *) {
            return configuration.supportedFamilies([
                .systemSmall,
                .systemMedium,
                .accessoryInline,
                .accessoryCircular,
                .accessoryRectangular
            ])
        } else {
            return configuration.supportedFamilies([.systemSmall, .systemMedium])
        }
    }
}
