import './ajax-settings.js'
$(document).ready(function () {
  // Lấy thẻ modal và nút mở modal
  var addModal = $('#add-topic-modal')
  var editModal = $('#edit-topic-modal')
  var addBtn = $('#add-topic-btn')
  var studyBtn = $('#study-topic-btn')
  var reviewBtn = $('#review-topic-btn')
  var editBtns = $('.edit-button')
  var delBtns = $('.delete-button')
  var searchBtn = $('#search-button')
  var addBtnModal = $('#add-topic-save')
  var editBtnModal = $('#edit-topic-save')

  editBtnModal.click(function () {
    var topicId = $('#edit-topic-id').val()
    var topicName = $('#edit-topic-title').val()
    var topicIndex = $('#edit-topic-index').val()
    var topicDescription = $('#edit-topic-description').val()
    var topicImage = $('#edit-topic-image-url').val()

    $.ajax({
      url: `/topic/`,
      type: 'POST',
      data: {
        id: topicId,
        name: topicName,
        index: topicIndex,
        description: topicDescription,
        image_url: topicImage
      },
      success: function (result) {
        if (result == 'success') {
          window.location.reload()
        }
      },
      error: function (xhr, status, error) {
        console.log(xhr.responseText)
      }
    })
  })

  addBtnModal.click(function () {
    var topicName = $('#add-topic-title').val()
    var topicIndex = $('#add-topic-index').val()
    var topicDescription = $('#add-topic-description').val()
    var topicImage = $('#add-topic-image-url').val()

    $.ajax({
      url: `/topic/`,
      type: 'POST',
      data: {
        name: topicName,
        index: topicIndex,
        description: topicDescription,
        image_url: topicImage
      },
      success: function (result) {
        if (result == 'success') {
          window.location.reload()
        }
      },
      error: function (xhr, status, error) {
        console.log(xhr.responseText)
      }
    })
  })

  function displaySearchResults(results) {
    const searchResults = $('.result-search')
    searchResults.empty()

    if (results.length === 0) {
      searchResults.text('No results found.')
      return
    }

    const resultHtml = results
      .map(
        (item) =>
          `<div class="meaning">
					${item.meaning}
					<div class="totals">
					  <div class="attempts">${item.attempts.right} / ${item.attempts.total} attempts</div>
					  <div class="checks">${item.checks.right} / ${item.checks.total} checks</div>
					</div>
				  </div>
				  <div class="word">${item.word.toUpperCase()}</div>
				  <div class="pronounciation" style="font-size: smaller; color: lightgrey;">${item.pronounciation}</div>
				  <div class="topic">${item.topic}</div>`
      )
      .join('')

    searchResults.html(resultHtml)
  }

  searchBtn.click(function () {
    var searchInput = $('#search-input').val()
    if (searchInput !== '') {
      $.ajax({
        url: `/topic/search/`,
        type: 'POST',
        data: {
          search_term: searchInput
        },
        success: function (result) {
          displaySearchResults(result)
        }
      })
    }
  })

  editBtns.click(function () {
    console.log('hello')
    // get topic id from checkbox id

    var topicId = $(this).parents('.card').find('.card-body input[type="checkbox"]').attr('id')
    var topicName = $(this).parents('.card').find('.card-body .card-title').text()
    var topicIndex = $(this).parents('.card').find('.card-body .topic-index').val()
    var topicDescription = $(this).parents('.card').find('.card-body .card-text').text()
    var topicImage = $(this).data('topic-image')
    editModal.find('#edit-topic-id').val(topicId)
    editModal.find('#edit-topic-title').val(topicName)
    editModal.find('#edit-topic-index').val(topicIndex)
    editModal.find('#edit-topic-description').val(topicDescription)
    // editModal.find("#edit-topic-image-url").val(topicImage);
    editModal.modal('show')
  })

  delBtns.click(function () {
    // display confirmation
    var topicId = $(this).parents('.card').find('.card-body input[type="checkbox"]').attr('id')
    if (confirm('Are you sure you want to delete this topic?')) {
      $.ajax({
        url: `/topic/`,
        type: 'DELETE',
        data: {
          topic_id: topicId
        },
        success: function (result) {
          window.location.reload()
        },
        error: function (result) {
          console.log(result)
        }
      })
    }
  })

  function getMaxIndex() {
    var max = 0
    $('.topic-index').each(function () {
      var index = parseInt($(this).val())
      if (index > max) {
        max = index
      }
    })
    return max
  }
  // Hiển thị modal khi click vào nút Add
  addBtn.click(function () {
    var index = getMaxIndex() + 1
    $('#add-topic-index').val(index)
    addModal.modal('show')
  })

  function getTopics() {
    var topics = []
    $("input[name='topic-choice']:checked").each(function () {
      // Access the value or other attributes of each checked checkbox
      // var checkboxValue = $(this).val();
      topics.push($(this).attr('id'))
      // ... do something with the values ...
    })
    return topics
  }

  studyBtn.click(function () {
    var topic_ids = getTopics()
    var queryString = topic_ids.map((id) => `topic_id=${id}`).join('&')
    window.location.href = `/v2/study/?${queryString}`
  })

  reviewBtn.click(function () {
    var topic_ids = getTopics()
    var queryString = topic_ids.map((id) => `topic_id=${id}`).join('&')
    window.location.href = `/review/?${queryString}`
  })
})
