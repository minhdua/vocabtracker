$(document).ready(function () {
  function getNextIndex() {
    let index = $("table#vocab-table tbody tr:last th").text() ?? 0;
    return parseInt(index) + 1;
  }

  function genNewRow() {
    let index = getNextIndex();
    let row = ` <tr>
        <th scope="row" class="index">${index}</th>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td><i class="fa fa-times remove-row"></td>
   </tr>`;
    return row;
  }

  $("#add-row").on("click", () => {
    var lastRow = $("table#vocab-table tbody tr:last");
    var newRow = lastRow.clone();
    newRow.find("input").val("");
    newRow.find("th:first").text(parseInt(lastRow.find("th:first").text()) + 1);
    $("table#vocab-table tbody").append(newRow);
  });

  $("table#vocab-table tbody").on("click", ".remove-row", (e) => {
    $(e.target).closest("tr").remove();
    $("table#vocab-table tbody th").each(function (index, e) {
      $(e).text(index + 1);
    });
  });
});
