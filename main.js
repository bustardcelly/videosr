import Publisher from './src/publisher'
import Subscriber from './src/subscriber'
import StatsTracker from './src/stats'

window.red5prosdk.setLogLevel('debug')

const startPublishButton = document.querySelector('#start-publish')
const publisherEventField = document.querySelector('#publisher-event')
const publisherBitrateField = document.querySelector('#publisher-bitrate-stat')
const resolutionSelect = document.querySelector('#resolution-select')

const subscriberVideo = document.querySelector('#red5pro-subscriber')
const startSubscribeButton = document.querySelector('#start-subscribe')
const subscriberEventField = document.querySelector('#subscriber-event')
const subscriberBitrateField = document.querySelector('#subscriber-bitrate-stat')

const canvas = document.getElementById('subscriber-canvas')
var ctx = canvas.getContext('2d')

let publisher, subscriber

const config = {
  protocol: 'ws',
  host: 'localhost',
  port: 5080,
  streamName: 'stream1'
}

const onResolutionChange = event => {
  const scale = resolutionSelect.value
  if (publisher) {
    publisher.setScale(scale)
  }
}

const onPublisherEvent = ({ publisher, event }) => {
  const { type } = event
  publisherEventField.textContent = type
}

const onSubscriberEvent = ({ publisher, event }) => {
  const { type } = event
  if (type !== 'Subscribe.Time.Update') {
    subscriberEventField.textContent = type
  }
}

const onPublisherStats = ({ bitrate }) => {
  publisherBitrateField.textContent = `Outgoing Bitrate: ${Math.round(bitrate)}`
}

const onSubscriberStats = ({ bitrate }) => {
  subscriberBitrateField.textContent = `Incoming Bitrate: ${Math.round(bitrate)}`
}

const updateSubscriberCanvas = () => {
  const { clientWidth, clientHeight, videoWidth, videoHeight } = subscriberVideo
  canvas.width = videoWidth
  canvas.height = videoHeight
  canvas.style.width = `${clientWidth}px`
  canvas.style.height = `${clientHeight}px`
  ctx.drawImage(subscriberVideo, 0, 0, videoWidth, videoHeight)
  requestAnimationFrame(updateSubscriberCanvas)
}

const startPublish = async () => {
  try {
    publisher = new Publisher().init(config, resolutionSelect.value)
    publisher.delegate = onPublisherEvent
    await publisher.start()
    new StatsTracker(onPublisherStats).start(publisher.getConnection())
  } catch (e) {
    console.error(e)
  }
}

const startSubscriber = async () => {
  try {
    subscriber = new Subscriber().init({...config,
      subscriberId: `subscriber-${Math.floor(Math.random() * 0x10000).toString(16)}`
    })
    subscriber.delegate = onSubscriberEvent
    await subscriber.start()
    new StatsTracker(onSubscriberStats).start(subscriber.getConnection(), false)
    updateSubscriberCanvas()
  } catch (e) {
    console.error(e)
  }
}

startPublishButton.addEventListener('click', startPublish)
resolutionSelect.addEventListener('change', onResolutionChange)

startSubscribeButton.addEventListener('click', startSubscriber)