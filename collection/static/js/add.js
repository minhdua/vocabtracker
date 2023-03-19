$(document).ready(function () {
	function getNextIndex() {
		let index = $("table#vocab-table tbody tr:last th").text() || 0;
		console.log("getNextIndex", index);
		return parseInt(index) + 1;
	}

	function genNewRow() {
		let index = getNextIndex();
		console.log("index", index);
		let row = `<tr>
      <th scope="row" class="index">${index}</th>
      <td><input type="text" name="form-0-word" required></td>
      <td><input type="text" name="form-0-pronunciation"></td>
      <td><input type="text" name="form-0-meaning" required></td>
      <td><i class="fa fa-times remove-row"></i></td>
   </tr>`;
		return $(row);
	}

	function addNewRow() {
		var lastRow = $("table#vocab-table tbody tr:last");
		var newRow = genNewRow();
		var formsetPrefix = $("button#add-row").data("formset");
		var index = $("#id_" + formsetPrefix + "-TOTAL_FORMS").val();
		newRow.find("input").each(function () {
			var field_name = $(this)
				.attr("name")
				.replace(/-\d+-/, "-" + index + "-");
			$(this).attr("name", field_name);
			$(this).attr("id", "id_" + field_name);
			$(this).val("");
		});
		$("table#vocab-table tbody").append(newRow);
		$("#id_" + formsetPrefix + "-TOTAL_FORMS").val(parseInt(index) + 1);
	}

	$("#add-row").on("click", () => {
		addNewRow();
	});

	$("table#vocab-table tbody").on("click", ".remove-row", (e) => {
		var rows = $("table#vocab-table tbody tr");
		if (rows.length > 1) {
			$(e.target).closest("tr").remove();
			$("table#vocab-table tbody tr").each(function (index) {
				$(this)
					.find(".index")
					.text(index + 1);
				$(this)
					.find("input[type='hidden'][name$='-id']")
					.attr("name", "form-" + index + "-id")
					.attr("id", "id_form-" + index + "-id");
				$(this)
					.find("input[type='text'][name$='-word']")
					.attr("name", "form-" + index + "-word")
					.attr("id", "id_form-" + index + "-word");
				$(this)
					.find("input[type='text'][name$='-pronunciation']")
					.attr("name", "form-" + index + "-pronunciation")
					.attr("id", "id_form-" + index + "-pronunciation");
				$(this)
					.find("input[type='text'][name$='-meaning']")
					.attr("name", "form-" + index + "-meaning")
					.attr("id", "id_form-" + index + "-meaning");
			});
			var rows = document.querySelectorAll("#vocab-table tbody tr");
			var numRows = rows.length;
			document.querySelector("#id_form-TOTAL_FORMS").value = numRows;
		}
	});

	function init() {
		var rows = $("table#vocab-table tbody tr");
		if (rows.length < 1) {
			addNewRow();
		}
	}

	init();
});
