$.ajaxSetup({
	beforeSend: function (xhr, settings) {
		function getCookie(name) {
			var cookieValue = null;
			if (document.cookie && document.cookie !== "") {
				var cookies = document.cookie.split(";");
				for (var i = 0; i < cookies.length; i++) {
					var cookie = cookies[i].trim();
					// Tìm cookie có tên giống với CSRF token
					if (cookie.substring(0, name.length + 1) === name + "=") {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
		if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
			// Thêm CSRF token vào header của yêu cầu POST
			xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		}
	},
});
