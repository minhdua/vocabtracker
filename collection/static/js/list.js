import "./ajax-settings.js";
$(document).ready(function () {
	// Lấy thẻ modal và nút mở modal
	var modal = $("#add-topic-modal");
	var addBtn = $("#add-topic-btn");
	var studyBtn = $("#study-topic-btn");
	var reviewBtn = $("#review-topic-btn");

	// Hiển thị modal khi click vào nút Add
	addBtn.click(function () {
		modal.modal("show");
	});

	function getTopics() {
		var topics = [];
		$("input[name='topic-choice']:checked").each(function () {
			// Access the value or other attributes of each checked checkbox
			// var checkboxValue = $(this).val();
			topics.push($(this).attr("id"));
			// ... do something with the values ...
		});
		return topics;
	}

	studyBtn.click(function () {
		var topic_ids = getTopics();
		var queryString = topic_ids.map((id) => `topic_id=${id}`).join("&");
		window.location.href = `/study/?${queryString}`;
	});

	$("#review-topic-btn").click(function () {
		var topic_ids = getTopics();
		var queryString = topic_ids.map((id) => `topic_id=${id}`).join("&");
		window.location.href = `/review/?${queryString}`;
	});
});
