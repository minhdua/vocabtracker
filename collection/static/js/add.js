$(document).ready(function () {
  var btnImportExcel = $('#import-excel')
  var btnImportJson = $('#import-json')
  var btnImportJsonModal = $('#import-json-button')

  var table = $('#vocab-table').DataTable({
    dom: 'Bfrtip',
    buttons: ['copy', 'excel', 'pdf'],
    select: true
  })

  btnImportJson.click(function () {
    //clear textarea
    $('#json-textarea').val('')
    $('#import-json-modal').modal('show')
  })

  btnImportJsonModal.click(function () {
    var json = JSON.parse($('#json-textarea').val())
    // add row from json on ui
    for (var i = 0; i < json.length; i++) {
      // get last row if it is null or empty else create new row
      var lastRow = $('table#vocab-table tbody tr:last')
      var word = lastRow.find("input[name$='-word']").val()
      var pronunciation = lastRow.find("input[name$='-pronunciation']").val()
      var meaning = lastRow.find("input[name$='-meaning']").val()
      var image_url = lastRow.find("input[name$='-image_url']").val()
      if (word !== '' || pronunciation !== '' || meaning !== '' || image_url !== '') {
        addNewRow()
        // reget last row
        lastRow = $('table#vocab-table tbody tr:last')
      }
      // update last row
      lastRow.find("input[name$='-word']").val(json[i].word)
      lastRow.find("input[name$='-pronunciation']").val(json[i].pronunciation)
      lastRow.find("input[name$='-meaning']").val(json[i].meaning)
      lastRow.find("input[name$='-image_url']").val(json[i].image_url)
    }
    // close modal
    $('#import-json-modal').modal('hide')
  })

  function getNextIndex() {
    let index = $('table#vocab-table tbody tr:last th').text() || 0
    console.log('getNextIndex', index)
    return parseInt(index) + 1
  }

  function genNewRow() {
    let index = getNextIndex()
    console.log('index', index)
    let row = `<tr>
      <th scope="row" class="index">${index}</th>
      <td><input type="text" name="form-0-word" required></td>
      <td><input type="text" name="form-0-pronunciation"></td>
      <td><input type="text" name="form-0-meaning" required></td>
	  <td><input type="text" name="form-0-image_url"></td>
      <td><i class="fa fa-times remove-row"></i></td>
   </tr>`
    return $(row)
  }

  function addNewRow() {
    var lastRow = $('table#vocab-table tbody tr:last')
    var newRow = genNewRow()
    var formsetPrefix = $('button#add-row').data('formset')
    var index = $('#id_' + formsetPrefix + '-TOTAL_FORMS').val()
    newRow.find('input').each(function () {
      var field_name = $(this)
        .attr('name')
        .replace(/-\d+-/, '-' + index + '-')
      $(this).attr('name', field_name)
      $(this).attr('id', 'id_' + field_name)
      $(this).val('')
    })
    $('table#vocab-table tbody').append(newRow)
    $('#id_' + formsetPrefix + '-TOTAL_FORMS').val(parseInt(index) + 1)
  }

  $('#add-row').on('click', () => {
    addNewRow()
  })

  $('table#vocab-table tbody').on('click', '.remove-row', (e) => {
    var rows = $('table#vocab-table tbody tr')
    if (rows.length > 1) {
      $(e.target).closest('tr').remove()
      $('table#vocab-table tbody tr').each(function (index) {
        $(this)
          .find('.index')
          .text(index + 1)
        $(this)
          .find("input[type='hidden'][name$='-id']")
          .attr('name', 'form-' + index + '-id')
          .attr('id', 'id_form-' + index + '-id')
        $(this)
          .find("input[type='text'][name$='-word']")
          .attr('name', 'form-' + index + '-word')
          .attr('id', 'id_form-' + index + '-word')
        $(this)
          .find("input[type='text'][name$='-pronunciation']")
          .attr('name', 'form-' + index + '-pronunciation')
          .attr('id', 'id_form-' + index + '-pronunciation')
        $(this)
          .find("input[type='text'][name$='-meaning']")
          .attr('name', 'form-' + index + '-meaning')
          .attr('id', 'id_form-' + index + '-meaning')
        $(this)
          .find("input[type='text'][name$='-image_url']")
          .attr('name', 'form-' + index + '-image_url')
          .attr('id', 'id_form-' + index + '-image_url')
      })
      var rows = document.querySelectorAll('#vocab-table tbody tr')
      var numRows = rows.length
      document.querySelector('#id_form-TOTAL_FORMS').value = numRows
    }
  })

  function init() {
    var rows = $('table#vocab-table tbody tr')
    if (rows.length < 1) {
      addNewRow()
    }
    // set url for column image_url
    $('table#vocab-table tbody tr').each(function (index) {
      var image_url = $(this).find("input[name$='-image_url']").val()
      if (image_url !== '') {
        $(this).find("input[name$='-image_url']").after(`<img src="${image_url}" alt="image" width="300" height="150">`)
      }
    })
  }

  $('#copy-code').on('click', function () {
    $('#json-textarea').val(`
    function tableToJson(table) {
      var data = [];
    
      // Get all rows from table
      var rows = table.rows;
    
      // Get the header row
      var headerRow = rows[0];
    
      // Loop through rows (starting from second row)
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowData = {};
    
        // Loop through cells in this row
        for (var j = 0; j < row.cells.length; j++) {
          var cell = row.cells[j];
    
          // Get the header of this column as the column name
          var header = headerRow.cells[j].textContent.trim();
          var columnName = header;
    
          // Add the data to this row
          rowData[columnName] = cell.textContent.trim();
        }
    
        // Add this row to the data array
        data.push(rowData);
      }
    
      return data;
    }
    
    // Get the table element
    var table = document.querySelector('table');
    
    // Convert table to JSON
    var jsonData = tableToJson(table);
    
    // Convert data array to JSON string
    var jsonString = JSON.stringify(jsonData);
    console.log(jsonString);
    
    `)
  })

  $('#convert-json-button').on('click', function () {
    var json = $('#json-textarea').val()

    var data = JSON.parse(json)

    var table = $('<table></table>')
    var headerRow = $('<tr></tr>')

    // Tạo dropdown cho hàng tiêu đề
    for (var key in data[0]) {
      var dropdown = $('<select class="header-dropdown"></select>')
      dropdown.append($('<option value="' + key + '">' + key + '</option>'))
      dropdown.append($('<option value="no">No</option>'))
      dropdown.append($('<option value="word">Word</option>'))
      dropdown.append($('<option value="pronunciation">Pronunciation</option>'))
      dropdown.append($('<option value="meaning">Meaning</option>'))

      var headerCell = $('<th></th>').append(dropdown)
      headerRow.append(headerCell)
    }

    table.append(headerRow)

    data.forEach(function (rowData) {
      var row = $('<tr></tr>')
      for (var key in rowData) {
        var cell = $('<td></td>').text(rowData[key])
        row.append(cell)
      }
      table.append(row)
    })

    $('#json-table').append(table)

    // Áp dụng CSS cho bảng
    $('#json-table table').css({
      width: '100%',
      borderCollapse: 'collapse'
    })

    $('#json-table th, #json-table td').css({
      padding: '8px',
      border: '1px solid #ddd'
    })

    $('#json-table th').css({
      backgroundColor: '#f2f2f2'
    })

    // Xử lý sự kiện thay đổi dropdown
    $('.header-dropdown').change(function () {
      var columnIndex = $(this).parent().index()
      var selectedValue = $(this).val()
      var headerCell = $(this).parent()

      // Cập nhật nội dung tiêu đề
      headerCell.text(selectedValue)

      // Lặp qua các hàng dữ liệu và cập nhật nội dung tương ứng
      $('#json-table tr:has(td)').each(function () {
        var cell = $(this).find('td').eq(columnIndex)
        var value = cell.text()
        cell.text(value)

        // Cập nhật thuộc tính class cho cell
        cell.removeClass()
        cell.addClass(selectedValue)
      })
    })
  })

  init()
})
