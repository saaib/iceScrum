import org.icescrum.atmosphere.IceScrumMeteorHandler

defaultMapping = "/stream/app/*"

servlets = [
        MeteorServletDefault: [
                className : "org.icescrum.atmosphere.IceScrumMeteorServlet",
                mapping   : "/stream/app/*",
                handler   : IceScrumMeteorHandler,
                initParams: [
                        "org.atmosphere.cpr.broadcasterCacheClass"                                   : "org.atmosphere.cache.UUIDBroadcasterCache",
                        "org.atmosphere.cpr.AtmosphereFramework.analytics"                           : false,
                        "org.atmosphere.interceptor.HeartbeatInterceptor.heartbeatFrequencyInSeconds": 30, // seconds
                        "org.atmosphere.cpr.CometSupport.maxInactiveActivity"                        : 30 * 60000, // 30 minutes
                        "org.atmosphere.cpr.broadcasterClass"                                        : "org.icescrum.atmosphere.IceScrumBroadcaster",
                        "org.atmosphere.cpr.Broadcaster.sharedListenersList"                         : true,
                        "org.atmosphere.cpr.AtmosphereInterceptor"                                   : """
                                org.atmosphere.client.TrackMessageSizeInterceptor,
                                org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor
                        """,
                ]
        ]
]