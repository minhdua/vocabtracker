$(document).ready(function () {
	// Lấy thẻ modal và nút mở modal
	var modal = $("#add-topic-modal");
	var btn = $("#add-topic-btn");

	// Lấy các phần tử trong form và các nút trong modal
	var form = modal.find("#add-topic-form");
	var title = form.find("#add-topic-title");
	var description = form.find("#add-topic-description");
	var imageUrl = form.find("#add-topic-image-url");
	var saveBtn = modal.find("#add-topic-save");

	// Hiển thị modal khi click vào nút Add
	btn.click(function () {
		modal.modal("show");
	});

	// Xử lý khi click vào nút Save
	// saveBtn.click(function () {
	// 	// Lấy giá trị trong form
	// 	var newTitle = title.val();
	// 	var newDescription = description.val();
	// 	var newImageUrl = imageUrl[0].files[0];

	// 	// Kiểm tra giá trị nhập vào có hợp lệ không
	// 	if (newTitle == "" || newDescription == "") {
	// 		alert("Please enter valid values");
	// 		return;
	// 	}

	// 	// Tạo đối tượng FormData để chứa dữ liệu gửi lên
	// 	var formData = new FormData();
	// 	formData.append("title", newTitle);
	// 	formData.append("description", newDescription);
	// 	formData.append("image", newImageUrl);
	// 	formData.append("csrfmiddlewaretoken", "{{ csrf_token }}");

	// 	$.ajax({
	// 		type: "POST",
	// 		url: "{% url 'add_topic' %}",
	// 		data: data,
	// 		success: function (response) {
	// 			if (response.status == "success") {
	// 				// Thêm topic mới vào danh sách và đóng modal dialog
	// 				var newTopicHtml =
	// 					'<div class="col">' +
	// 					'<div class="card">' +
	// 					'<img src="' +
	// 					newImageUrl +
	// 					'" class="card-img-top" alt="...">' +
	// 					'<div class="card-body">' +
	// 					'<h5 class="card-title">' +
	// 					newTitle +
	// 					"</h5>" +
	// 					'<p class="card-text">' +
	// 					newDescription +
	// 					"</p>" +
	// 					'<a href="#" class="btn btn-primary">Learn More</a>' +
	// 					"</div>" +
	// 					"</div>" +
	// 					"</div>";

	// 				var row = $(".row-cols-md-4");
	// 				row.append(newTopicHtml);
	// 				modal.modal("hide");
	// 			} else {
	// 				alert("Failed to add new topic");
	// 			}
	// 		},
	// 		error: function (xhr, status, error) {
	// 			alert("Failed to add new topic: " + error);
	// 		},
	// 	});
	// });
});
