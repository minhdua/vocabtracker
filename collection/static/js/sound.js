const LANG_JP_SPEECH = 'ja-JP'
const LANG_VI_SPEECH = 'vi-VN'
const LANG_EN_SPEECH = 'en-US'
const DEFAULT_RATE_SPEECH = 0.5
let currentUtterance = null

function speak(word, lang, rate) {
  const msg = new SpeechSynthesisUtterance()
  msg.lang = lang
  msg.text = word
  msg.rate = rate
  currentUtterance = msg
  msg.onend = function () {
    currentUtterance = null
  }
  window.speechSynthesis.speak(msg)
}

function getConfig(lang) {
  switch (lang) {
    case 'jp':
      return { lang: LANG_JP_SPEECH, rate: DEFAULT_RATE_SPEECH }
    case 'vi':
      return { lang: LANG_VI_SPEECH, rate: DEFAULT_RATE_SPEECH }
    default:
      return { lang: LANG_EN_SPEECH, rate: DEFAULT_RATE_SPEECH }
  }
}

export function speech(word, lang, isBlock) {
  if (isBlock && currentUtterance) {
    window.speechSynthesis.cancel()
  }

  const config = getConfig(lang)
  speak(word, config.lang, config.rate)
}
