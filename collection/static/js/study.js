import { speech } from "./sound.js";
import "./ajax-settings.js";
$(document).ready(function () {
	var vocabularies = JSON.parse($("#vocabularies-data").val());

	var soundOn = false;
	var currentIndex = 0;

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
		$("#word").text(currentWord.word);
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
			$(this).text("Sound On");
		} else {
			$(this).text("Sound Off");
		}
	}

	function init() {
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
			} else {
				displayWord();
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
				isCommands = true;
			} else if (line.startsWith("\\goto")) {
				let tokens = line.split(" ");
				let gotoIndex = parseInt(tokens[1]);
				if (gotoIndex > 0 && gotoIndex <= vocabularies.length) {
					currentIndex = gotoIndex - 1;
					displayWord();
					clearInput();
					isCommands = true;
				}
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
			} else if (line.startsWith("\\review")) {
				// Lấy đường dẫn hiện tại của URL
				var path = window.location.pathname;

				// Tách đường dẫn thành các phần bằng dấu "/"
				var paths = path.split("/").filter(function (path) {
					return path !== "";
				});

				// Lấy phần tử cuối cùng trong mảng parts, đó chính là số 2
				var number = paths[paths.length - 1];

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
					window.location.href = url.toString();
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
});
