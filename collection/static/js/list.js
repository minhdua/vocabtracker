import "./ajax-settings.js";
$(document).ready(function () {
	// Lấy thẻ modal và nút mở modal
	var modal = $("#add-topic-modal");
	var addBtn = $("#add-topic-btn");
	var studyBtn = $("#study-topic-btn");

	// Hiển thị modal khi click vào nút Add
	addBtn.click(function () {
		modal.modal("show");
	});

	studyBtn.click(function () {
		var topic_ids = [];
		$("input[name='topic-choice']:checked").each(function () {
			// Access the value or other attributes of each checked checkbox
			// var checkboxValue = $(this).val();
			topic_ids.push($(this).attr("id"));
			// ... do something with the values ...
		});
		$.ajax({
			url: "/study/", // Địa chỉ URL của API của bạn
			method: "POST", // Phương thức của yêu cầu
			data: { topic_ids: JSON.stringify(topic_ids) }, // Dữ liệu gửi lên máy chủ
			success: function (data) {
				// save vào local storage
				localStorage.setItem("vocabularies", JSON.stringify(data["vocabularies"]));
				window.location.href = "/study/";
			},
			error: function (xhr, status, error) {
				// Xử lý lỗi nếu có
				console.error(error);
				// clearInput();
			},
			// Prevent the default action of the Enter key (i.e., adding a new line)
		});
	});
});
