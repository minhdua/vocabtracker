const LANG_JP_SPEECH = "ja-JP";
const DEFAULT_VOICE_SPEECH = "Google 日本語";
const DEFAULT_RATE_SPEECH = 0.5;
let currentUtterance = null;
export function speech(word) {
	if (currentUtterance && window.speechSynthesis.speaking) {
		// nếu đang trong quá trình đọc văn bản, hủy đối tượng đang đọc
		currentUtterance.cancel();
	}
	// Speech Japanese
	var msg = new SpeechSynthesisUtterance(word);
	msg.lang = LANG_JP_SPEECH;
	msg.voiceURI = DEFAULT_VOICE_SPEECH;
	msg.rate = DEFAULT_RATE_SPEECH;
	currentUtterance = msg;
	msg.onend = function () {
		currentUtterance = null;
	};
	window.speechSynthesis.speak(msg);
}
