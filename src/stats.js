// Based on https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/bandwidth/js/main.js
const egressTypes = ['outboundrtp', 'outbound-rtp', 'ssrc']
const egressProp = 'bytesSent'
const ingestTypes = ['inboundrtp', 'inbound-rtp', 'ssrc']
const ingestProp = 'bytesReceived'

const vRegex = /VideoStream/

class StatsTracker {

    constructor (delegate) {
        this.interval = undefined
        this.connection = undefined
        this.delegate = delegate
    }

    start (connection, egress = true) {
        let lastReport

        this.interval = setInterval(async () => {
            try {
                const stats = await connection.getStats()
                stats.forEach(report => {
                    let bytes = 0
                    let now = report.timestamp
                    let bitrate = 0
                    if (egress && egressTypes.indexOf(report.type) > -1 && report[egressProp]) {
                        if (report.mediaType === 'video' || report.id.match(vRegex)) {
                            if (lastReport && lastReport.get(report.id)) {
                                const prev = lastReport.get(report.id)
                                bytes = report[egressProp]
                                bitrate = 8 * (bytes - prev[egressProp]) / 
                                                (now - prev.timestamp)
                                this.delegate.call(null, { bitrate })
                            }
                        }
                    } else if (!egress && ingestTypes.indexOf(report.type) > -1 && report[ingestProp]) {
                        if (report.mediaType === 'video' || report.id.match(vRegex)) {
                            if (lastReport && lastReport.get(report.id)) {
                                const prev = lastReport.get(report.id)
                                bytes = report[ingestProp]
                                bitrate = 8 * (bytes - prev[ingestProp]) / 
                                                (now - prev.timestamp)
                                this.delegate.call(null, { bitrate })
                            }
                        }
                    }
                })
                lastReport = stats
            } catch (e) {
                console.error(e)
            }
        }, 1000)
    }

    stop () {
        clearInterval(this.interval)
    }

}

export default StatsTracker