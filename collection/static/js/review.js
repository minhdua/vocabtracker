import { speech } from "./sound.js";
import "./ajax-settings.js";
$(document).ready(function () {
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
			questions.push({
				word_id: word_id,
				answer: selectedAnswer || "no answer",
				correct_answer: correctAnswer,
			});
			// Kiểm tra xem câu trả lời được chọn có khớp với câu trả lời đúng hay không
			if (selectedAnswer && selectedAnswer == correctAnswer) {
				// Nếu khớp, đặt màu xanh lá cây cho câu trả lời được chọn
				$(element)
					.find('.answer input[value="' + correctAnswer + '"]')
					.parent()
					.css("color", "#b7e1cd")
					.css("background-color", "#0f5132");
			} else {
				// Nếu không khớp, đặt màu đỏ cho câu trả lời được chọn
				$(element).find('.answer input[type="radio"]:checked').parent().css("color", "#842029").css("background-color", "#f8d7da");
				//Tô màu xanh cho câu trả lời đúng
				$(element)
					.find('.answer input[value="' + correctAnswer + '"]')
					.parent()
					.css("color", "#1e4477")
					.css("background-color", "#cfe2f3");
			}
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
