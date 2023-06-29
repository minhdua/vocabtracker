const LANG_JP_SPEECH = 'ja-JP'
const LANG_VI_SPEECH = 'vi-VN'
const LANG_EN_SPEECH = 'en-US'
// const DEFAULT_VOICE_SPEECH = 'Google 日本語'
const DEFAULT_RATE_SPEECH = 0.5
let currentUtterance = null
export function speech(word, lang = LANG_JP_SPEECH, rate = DEFAULT_RATE_SPEECH) {
  if (currentUtterance && window.speechSynthesis.speaking) {
    // nếu đang trong quá trình đọc văn bản, hủy đối tượng đang đọc
    currentUtterance.cancel()
  }
  // Speech Japanese
  var msg = new SpeechSynthesisUtterance()
  msg.lang = lang
  msg.text = word
  //   msg.voiceURI = DEFAULT_VOICE_SPEECH
  msg.rate = rate
  currentUtterance = msg
  msg.onend = function () {
    currentUtterance = null
  }
  window.speechSynthesis.speak(msg)
}
