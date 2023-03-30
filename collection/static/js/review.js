import { speech } from "./sound.js";
import "./ajax-settings.js";
$(document).ready(function () {
	var questions = JSON.parse(localStorage.getItem("questions"));
	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	init();
	function init() {
		var html = "";
		if (Array.isArray(questions) && questions.length > 0) {
			var index = 0;
			questions = shuffleArray(questions);
			questions.forEach(function (question) {
				html += `
					<div class="question" id="question-${index}" "background-color: #f5f5f5; padding: 20px; border: 1px solid #cccccc; border-radius: 4px; font-size: 16px">
						<div class="word">
							<input type="hidden" name="word_id" value="${question.word_id}">
							<input type="hidden" name="word_check" value="${question.word}">
							<input type="hidden" name="correct_answer" value="${question.correct_answer}">
						</div>`;
				var answer = "";
				var answerIndex = 0;
				question.distractors.forEach(function (distractor) {
					answer += `
						<input type="radio" name="answer-${index}" id="answer${index}-${answerIndex}" value="${distractor}">
						<label for="answer${index}-${answerIndex}">${distractor}</label>
						`;
					answerIndex++;
				});
				html += `
						<p style="margin-bottom: 5px">${index}. ${question.question}</p>
						<label style="margin-right: 10px">
							<div class="answer">
								${answer}
							</div>
							<input type="checkbox" name="flag" ${question.flag ? "checked" : ""} />
							<label for="flag">Markup</label>
							<input type="checkbox" name="uncheckifnull" ${question.uncheckifnull ? "checked" : ""} />
							<label for="uncheckifnull">Do not dot without selecting</label>
						</label>
					</div>
					`;

				index++;
			});
			$("#questions").html(html);
		} else {
			console.log("questions is not an array or contains no elements");
		}
	}

	$(".question").click(function (e) {
		if ($(e.target).is(".child")) {
			e.stopPropagation();
			return;
		}
		var word = $(this).find("input[name='word_check']").val();
		speech(word);
	});

	$("#submit").click(function () {
		//disable all radio
		$(".answer input[type='radio']").attr("disabled", true);
		$("#submit").attr("disabled", true);
		// Lặp lại các câu hỏi
		var questions = [];
		$(".question").each(function (index, element) {
			// Lấy id của từ vựng.
			var word_id = $(element).find('input[name="word_id"]').val();
			// Lấy giá trị câu trả lời đúng của câu hỏi
			var correctAnswer = $(element).find('input[name="correct_answer"]').val();
			// Lấy giá trị của câu trả lời được chọn
			var selectedAnswer = $(element).find('.answer input[type="radio"]:checked').val();

			// Kiểm tra xem câu trả lời được chọn có khớp với câu trả lời đúng hay không
			if (selectedAnswer && selectedAnswer == correctAnswer) {
				// Nếu khớp, đặt màu xanh lá cây cho câu trả lời được chọn
				$(element)
					.find('input[value="' + correctAnswer + '"]')
					.next("label")
					.css("color", "#b7e1cd")
					.css("background-color", "#0f5132");
				if (!flagUncheckIfNull) {
					$(element).find('input[name="flag"').prop("checked", false);
				}
			} else {
				if (!selectedAnswer && flagUncheckIfNull) {
					return;
				}
				// Nếu không khớp, đặt màu đỏ cho câu trả lời được chọn
				$(element).find('input[type="radio"]:checked').next("label").css("color", "#842029").css("background-color", "#f8d7da");
				//Tô màu xanh cho câu trả lời đúng
				$(element)
					.find('input[value="' + correctAnswer + '"]')
					.next("label")
					.css("color", "#1e4477")
					.css("background-color", "#cfe2f3");

				$(element).find('input[name="flag"').prop("checked", true);
			}

			var flag = false;
			if ($(element).find('input[name="flag"').is(":checked")) {
				flag = true;
			}

			var flagUncheckIfNull = false;
			if ($(element).find('input[name="uncheckifnull"').is(":checked")) {
				flagUncheckIfNull = true;
			}

			questions.push({
				word_id: word_id,
				answer: selectedAnswer || "no answer",
				correct_answer: correctAnswer,
				flag: flag,
				uncheck_ifnull: flagUncheckIfNull,
			});
		});

		$.ajax({
			url: "/review/handle_review/", // Địa chỉ URL của API của bạn
			method: "POST", // Phương thức của yêu cầu
			data: { questions: JSON.stringify(questions) }, // Dữ liệu gửi lên máy chủ
			success: function (data) {
				// Xử lý kết quả trả về từ máy chủ
			},
			error: function (xhr, status, error) {
				// Xử lý lỗi nếu có
				console.error(error);
			},
			// Prevent the default action of the Enter key (i.e., adding a new line)
		});
	});
});
