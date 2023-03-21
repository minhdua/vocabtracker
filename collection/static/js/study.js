import { speech } from "./sound.js";
import "./ajax-settings.js";
import colors from "./const.js";
$(document).ready(function () {
	var vocabularies = JSON.parse($("#vocabularies-data").val());

	var soundOn = true;
	var currentIndex = 0;

	let timer;
	let startTime;
	var path = window.location.pathname;
	var mode = 0; //normal
	var pausedTime = null;
	// Tách đường dẫn thành các phần bằng dấu "/"
	var paths = path.split("/").filter(function (path) {
		return path !== "";
	});

	// Lấy phần tử cuối cùng trong mảng parts, đó chính là số 2
	var topicId = paths[paths.length - 1];

	function updateAttemptsTotal() {
		var attempts_total = 0;
		var attempts_correct = 0;
		var checks_total = 0;
		var check_correct = 0;
		for (var v of vocabularies) {
			attempts_total += v.attempts_total;
			attempts_correct += v.attempts_correct;
			checks_total += v.checks_total;
			check_correct += v.checks_correct;
		}
		$("#total-checks").text(`${check_correct}/ ${checks_total}`);
		$("#total-correct").text(`${attempts_correct}/ ${attempts_total}`);
	}
	init();
	function getCurrentWord() {
		return vocabularies[currentIndex];
	}
	function displayWord() {
		var currentWord = getCurrentWord();
		$("#no").text(currentIndex + 1);
		if (mode === 0) $("#word").text(currentWord.word);
		else $("#word").text("");
		$("#meaning").text(currentWord.meaning);
		$("#pronunciation").text(currentWord.pronunciation);
		$("#correct-attempts").text(`${currentWord.attempts_correct || 0}/${currentWord.attempts_total || 0}`);
		$("#correct-checks").text(`${currentWord.checks_correct || 0}/${currentWord.checks_total || 0}`);
		$("#total-word").text(vocabularies.length);
		if (soundOn) {
			speech(currentWord.word);
		}
		checkOnOffButton();
		updateAttemptsTotal();

		var topicStorage = JSON.parse(localStorage.getItem("currentIndex"));
		if (!topicStorage) {
			topicStorage = new Object();
		}
		topicStorage[topicId] = currentIndex;
		localStorage.setItem("currentIndex", JSON.stringify(topicStorage));
		if (currentWord.flag) {
			$("th i.fa-bookmark").removeAttr("hidden", true);
		} else {
			$("th i.fa-bookmark").attr("hidden", true);
		}
	}

	function checkOnOffButton() {
		$("#prev-btn").attr("disabled", true);
		$("#next-btn").attr("disabled", true);

		if (currentIndex > 0) {
			$("#prev-btn").removeAttr("disabled");
		}

		if (currentIndex < vocabularies.length) {
			$("#next-btn").removeAttr("disabled");
		}

		if (soundOn) {
			$("#sound-btn").text("Sound Off");
		} else {
			$("#sound-btn").text("Sound On");
		}
	}

	function init() {
		var index = 0;
		var topicStorage = JSON.parse(localStorage.getItem("currentIndex"));
		if (topicStorage) {
			index = topicStorage[topicId] || 0;
		}
		currentIndex = parseInt(index);
		displayWord();
	}

	$("#next-btn").click(function () {
		if (currentIndex + 1 < vocabularies.length) {
			currentIndex += 1;
			displayWord();
		}
	});

	$("#prev-btn").click(function () {
		if (currentIndex + 1 > 0) {
			currentIndex -= 1;
			displayWord();
		}
	});

	$("#sound-btn").click(function () {
		if (soundOn) {
			soundOn = false;
		} else {
			soundOn = true;
		}
		checkOnOffButton();
	});

	function clearInput() {
		$("#terminal").val("");
	}

	function showError(incorrect_words) {
		if (incorrect_words.length > 0) {
			$("#incorrect-last").text(incorrect_words.join("; "));
			$("#incorrect-last").removeAttr("hidden");
		} else {
			$("#incorrect-last").attr("hidden", true);
		}
	}

	$("#terminal").on("keydown", function (e) {
		startTimer();
		if (e.shiftKey && e.keyCode == 13) {
			// Shift + Enter key pressed
			var textareaText = $(this).val();
			var caretPos = this.selectionStart;
			var textBeforeCaret = textareaText.substring(0, caretPos);
			var textAfterCaret = textareaText.substring(caretPos, textareaText.length);
			$(this).val(textBeforeCaret + "\n" + textAfterCaret);
			// Move the caret to the new line
			this.setSelectionRange(caretPos + 1, caretPos + 1);
			// Prevent the default action of the Enter key (i.e., adding a new line)

			e.preventDefault();
		} else if (e.keyCode == 13 && !e.ctrlKey) {
			e.preventDefault();
			var word = getCurrentWord();
			// Enter key pressed without control key or Shift key
			var textareaText = $(this).val();
			// Do something with the textarea text
			var isCommands = checkCommands(textareaText);
			if (!isCommands) {
				$.ajax({
					url: "/study/handle_typing/", // Địa chỉ URL của API của bạn
					method: "POST", // Phương thức của yêu cầu
					data: { input: textareaText, vocab: word.id }, // Dữ liệu gửi lên máy chủ
					success: function (data) {
						// Xử lý kết quả trả về từ máy chủ
						vocabularies[currentIndex] = data;
						displayWord();
						clearInput();
						showError(data.incorect_word_last);
					},
					error: function (xhr, status, error) {
						// Xử lý lỗi nếu có
						console.error(error);
						clearInput();
					},
					// Prevent the default action of the Enter key (i.e., adding a new line)
				});
			}
		}
	});

	function checkCommands(inputText) {
		var lines = inputText.split("\n");
		var isCommands = false;
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i].trim();
			if (line.startsWith("\\pre")) {
				var skipNum = 1;
				var tokens = line.split(" ");
				if (tokens.length > 1) {
					skipNum = parseInt(tokens[1]);
				}
				currentIndex -= skipNum;
				if (currentIndex < 0) {
					currentIndex = 0;
				}
				displayWord();
				clearInput();
				resetTimer();
				isCommands = true;
			} else if (line.startsWith("\\next")) {
				var skipNum = 1;
				var tokens = line.split(" ");
				if (tokens.length > 1) {
					skipNum = parseInt(tokens[1]);
				}
				currentIndex += skipNum;
				if (currentIndex >= vocabularies.length) {
					currentIndex = vocabularies.length - 1;
				}
				displayWord();
				clearInput();
				resetTimer();
				isCommands = true;
			} else if (line.startsWith("\\goto")) {
				let tokens = line.split(" ");
				if (tokens.length > 1) {
					let gotoIndex = parseInt(tokens[1]);
					if (gotoIndex > 0 && gotoIndex <= vocabularies.length) {
						currentIndex = gotoIndex - 1;
					}
				} else {
					let nextFlagIndex = vocabularies.findIndex((vocabulary, index) => vocabulary.flag === true && index > currentIndex);
					if (nextFlagIndex !== -1) {
						currentIndex = nextFlagIndex;
					}
				}
				displayWord();
				clearInput();
				isCommands = true;
				resetTimer();
			} else if (line.startsWith("\\sound --off")) {
				soundOn = false;
				displayWord();
				clearInput();
				isCommands = true;
			} else if (line.startsWith("\\sound --on")) {
				soundOn = true;
				displayWord();
				clearInput();
				isCommands = true;
			} else if (line.startsWith("\\flag")) {
				let tokens = line.split(" ");
				if (tokens.length > 1) {
					if (tokens[1] === "--on") {
						vocabularies[currentIndex].flag = true;
					} else if (tokens[1] === "--off") {
						vocabularies[currentIndex].flag = false;
					}
				} else {
					vocabularies[currentIndex].flag = !vocabularies[currentIndex].flag;
				}
				displayWord();
				clearInput();
				isCommands = true;
			} else if (line.startsWith("\\mode")) {
				mode = (mode + 1) % 2;
				displayWord();
				clearInput();
				isCommands = true;
			} else if (line.startsWith("\\pause")) {
				pauseTimer();
				clearInput();
				isCommands = true;
			} else if (line.startsWith("\\review")) {
				// Lấy đường dẫn hiện tại của URL
				var number = topicId;

				// Kiểm tra xem number có phải là số hay không
				if (!isNaN(number)) {
					// Số 2 đã được lấy thành công, bạn có thể sử dụng biến number ở đây
					// Tạo ra đối tượng URL từ URL hiện tại
					var url = new URL(window.location.href);

					// Thay đổi đường dẫn và các tham số trên URL
					url.pathname = `/review/${number}/`;
					let fromIndex = 0;
					let toIndex = vocabularies.length - 1;
					let parts = line.split(" ");
					for (let j = 0; j < parts.length; j++) {
						if (parts[j] === "--from" && j + 1 < parts.length) {
							fromIndex = parseInt(parts[j + 1]) - 1;
						} else if (parts[j] === "--to" && j + 1 < parts.length) {
							toIndex = parseInt(parts[j + 1]) - 1;
						}
					}
					url.searchParams.set("from", fromIndex);
					url.searchParams.set("to", toIndex);
					// Chuyển hướng đến URL mới
					window.open(url.toString(), "_blank");
				} else {
					// Không tìm thấy số trên URL
					console.log("Number not found in URL");
				}
				i = lines.length; // break out of the loop
				displayWord();
				clearInput();
				isCommands = true;
			}
		}
		return isCommands;
	}

	function startTimer() {
		if (timer) {
			return;
		}

		if (pausedTime) {
			continueTimer();
			return;
		}
		startTime = new Date().getTime();
		timer = setInterval(updateTimer, 10);
	}

	function updateTimer() {
		let currentTime = new Date().getTime();
		let timeElapsed = currentTime - startTime;

		let hours = Math.floor(timeElapsed / (1000 * 60 * 60));
		let minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);

		hours = hours < 10 ? "0" + hours : hours;
		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		let milliseconds = timeElapsed % 1000;

		if (milliseconds < 10) {
			milliseconds = "000" + milliseconds;
		} else if (milliseconds < 100) {
			milliseconds = "00" + milliseconds;
		} else if (milliseconds < 1000) {
			milliseconds = "0" + milliseconds;
		}

		$("#timer").text(`${hours}:${minutes}:${seconds}:${milliseconds}`);
		if (minutes < 1 || (minutes < 2 && seconds < 30)) {
			$("#timer").css("background-color", colors.lightGreen).css("color", colors.darkGreen);
		} else if (minutes < 3) {
			$("#timer").css("background-color", colors.lightYellow).css("color", colors.darkYellow);
		} else if (minutes >= 3) {
			$("#timer").css("background-color", colors.lightPink).css("color", colors.darkRed);
		}
	}

	function stopTimer() {
		clearInterval(timer);
	}

	function resetTimer() {
		stopTimer();
		timer = null;
		$("#timer").text("00:00:00:0000");
		$("#timer").css("background-color", colors.lightGreen).css("color", colors.darkGreen);
	}

	function pauseTimer() {
		if (timer) {
			clearInterval(timer);
			timer = null;
			pausedTime = new Date().getTime();
		}
	}

	function continueTimer() {
		if (!timer && pausedTime) {
			startTime += new Date().getTime() - pausedTime;
			timer = setInterval(updateTimer, 10);
			pausedTime = null;
		}
	}
});
