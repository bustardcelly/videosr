class Subscriber {

    constructor () {
        this.config = undefined
        this.subscriber = undefined
        this.delegate = undefined
    }

    init (config, initialScale = 1.0) {
        this.config = config
        this.subscriber = new window.red5prosdk.RTCSubscriber()
        this.subscriber.on('*', this.onSubscriberEvent.bind(this))
        return this
    }

    async start () {
        await this.subscriber.init(this.config)
        await this.subscriber.subscribe()
    }

    getConnection () {
        return this.subscriber ? this.subscriber.getPeerConnection() : undefined
    }

    onSubscriberEvent (event) {
        const { type } = event
        if (type === 'Subscribe.Time.Update') return
        console.log(`[Subscriber(${this.config.streamName})]:: ${event.type}`)
        if (this.delegate) {
            this.delegate.call(null, { subscriber: this.subscriber, event })
        }
    }

}

export default Subscriber