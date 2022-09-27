class Publisher {

    constructor () {
        this.config = undefined
        this.initialScale = 1.0
        this.publisher = undefined
        this.delegate = undefined
    }

    init (config, initialScale = 1.0) {
        this.config = config
        this.initialScale = initialScale
        this.publisher = new window.red5prosdk.RTCPublisher()
        this.publisher.on('*', this.onPublisherEvent.bind(this))
        return this
    }

    async start () {
        await this.publisher.init(this.config)
        await this.publisher.publish()
        this.setScale(this.initialScale)
    }

    getTrackSender (connection, kind) {
        const senders = connection.getSenders()
        const sender = senders.find(s => s.track.kind === kind)
        return sender
      }

    setScale (scale) {
        const connection = this.publisher ? this.publisher.getPeerConnection() : undefined
        if (!!connection) {
            const sender = this.getTrackSender(connection, 'video')
            let params = sender.getParameters()
            if (!params.encodings) {
                params.encodings = [{}]
            }
            params.encodings[0].scaleResolutionDownBy = scale
            sender.setParameters(params)
        }
    }

    getConnection () {
        return this.publisher ? this.publisher.getPeerConnection() : undefined
    }

    onPublisherEvent (event) {
        console.log(`[Publisher(${this.config.streamName})]:: ${event.type}`)
        if (this.delegate) {
            this.delegate.call(null, { publisher: this.publisher, event })
        }
    }

}

export default Publisher