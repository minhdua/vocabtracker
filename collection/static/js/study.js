import { speech } from './sound.js'
import './ajax-settings.js'
import colors from './const.js'
$(document).ready(function () {
  var vocabularies = []

  var soundOn = true
  var isRepeat = true
  var intervalId = null
  var currentIndex = 0
  var indexKey = ''
  var indexHistory = {}
  let timer
  let startTime
  var path = window.location.pathname
  var mode = 0 //normal
  var pausedTime = null
  var kanjiModal = $('#kanji-info-modal')
  var editModal = $('#edit-vocabulary-modal')
  function updateAttemptsTotal() {
    var attempts_total = 0
    var attempts_correct = 0
    var checks_total = 0
    var check_correct = 0
    for (var v of vocabularies) {
      attempts_total += v.attempts_total
      attempts_correct += v.attempts_correct
      checks_total += v.checks_total
      check_correct += v.checks_correct
    }
    $('#total-checks').text(`${check_correct}/${checks_total}`)
    $('#total-correct').text(`${attempts_correct}/${attempts_total}`)
  }

  function getCurrentWord() {
    return vocabularies[currentIndex]
  }

  function startInterval() {
    if (intervalId) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(function () {
      if (soundOn) {
        var currentWord = getCurrentWord()
        speech(currentWord.word)
        speech(currentWord.meaning, 'vi-VN', 0.5)
      }
    }, 5000)
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function showKanjiInfo(kanji_word) {
    var currentWord = getCurrentWord()
    // Example values
    if (!currentWord.kanji_details) {
      currentWord.kanji_details = []
    }
    var detail = currentWord.kanji_details.find((item) => item.character === kanji_word)
    if (detail == null) {
      return
    }
    var kanji = detail.character
    var onyumi = detail.onyomi
    var kunyumi = detail.kunyomi
    var meaning = detail.meaning
    var sinoVietnamese = detail.sino_vietnamese
    var shape = detail.properties.shape
    var radical = detail.properties.radical
    var strokes = detail.properties.strokes
    var unicode = detail.properties.unicode
    var penStrokes = detail.properties.pen_strokes

    // Update the popup content with the example values
    document.getElementById('kanjiValue').textContent = kanji
    document.getElementById('onyumiValue').textContent = onyumi.join(', ')
    document.getElementById('kunyumiValue').textContent = kunyumi.join(', ')
    document.getElementById('meaningValue').textContent = meaning.join(', ')
    document.getElementById('sinoVietnameseValue').textContent = sinoVietnamese
    document.getElementById('shapeValue').textContent = shape
    document.getElementById('radicalValue').textContent = radical
    document.getElementById('strokesValue').textContent = strokes
    document.getElementById('unicodeValue').textContent = unicode
    document.getElementById('penStrokesValue').textContent = penStrokes
    kanjiModal.modal('show')
  }

  function displayWord() {
    if (!vocabularies || vocabularies.length === 0) {
      return
    }
    var currentWord = getCurrentWord()
    if (mode === 0) $('#word').text(currentWord.word)
    else $('#word').text('')
    $('#topic-name').text(currentWord.topic_name)
    $('#meaning').text(currentWord.meaning)
    $('#pronunciation').text(currentWord.pronunciation)
    $('#kanji').text(currentWord.kanji)
    $('#romaji').text(currentWord.romaji)
    $('#sino-viet').text(currentWord.sino_viet)
    $('#image img').attr('src', currentWord.image_url || '/static/images/default-image.png')
    $('#correct-attempts').text(`${currentWord.attempts_correct || 0}/${currentWord.attempts_total || 0}`)
    $('#correct-checks').text(`${currentWord.checks_correct || 0}/${currentWord.checks_total || 0}`)
    $('#total-word').text(vocabularies.length)
    $('#total-word').text(`${(currentIndex || 0) + 1}/${vocabularies.length || 0}`)

    if (isRepeat) {
      startInterval()
    } else {
      stopInterval()
      if (soundOn) {
        speech(currentWord.word)
      }
    }
    checkOnOffButton()
    updateAttemptsTotal()
    if (currentWord.flag) {
      $('th i.fa-bookmark').removeAttr('hidden', true)
    } else {
      $('th i.fa-bookmark').attr('hidden', true)
    }

    // set link for kanji
    var kanjiText = $('td#kanji').text()
    if (!currentWord.kanji_details) {
      currentWord.kanji_details = []
    }
    for (var i = 0; i < currentWord.kanji_details.length; i++) {
      var character = currentWord.kanji_details[i].character
      // create a tag
      var kanjiLink = $('<a></a>')

      // set href = # to prevent page reload
      kanjiLink.attr('href', '')
      // set onclick event and prevent page reload
      // kanjiLink.attr('onclick', 'showKanjiInfo($this); return false;')
      // set class for a tag
      kanjiLink.addClass('kanji-link')
      // set id for a tag
      kanjiLink.attr('id', character)
      // set text for a tag
      kanjiLink.text(character)
      // set style for tag
      kanjiLink.css('color', 'red')
      // set no underline for tag
      kanjiLink.css('text-decoration', 'none')
      // replace kanji text with a tag
      kanjiText = kanjiText.replace(character, kanjiLink.prop('outerHTML'))
    }
    // set event for all kanji link
    $('td#kanji').html(kanjiText)
    $('td#kanji')
      .find('a.kanji-link')
      .unbind('click')
      .click(function () {
        var kanji_word = $(this).text()
        showKanjiInfo(kanji_word)
        return false
      })

    // save index into local storage
    indexHistory[indexKey] = currentIndex
    localStorage.setItem('currentIndex', JSON.stringify(indexHistory))
  }

  function checkOnOffButton() {
    $('#prev-btn').attr('disabled', true)
    $('#next-btn').attr('disabled', true)

    if (currentIndex > 0) {
      $('#prev-btn').removeAttr('disabled')
    }

    if (currentIndex < vocabularies.length) {
      $('#next-btn').removeAttr('disabled')
    }

    if (soundOn) {
      $('#sound-btn').text('Sound Off')
    } else {
      $('#sound-btn').text('Sound On')
    }
  }

  function getKeyFromParams() {
    var queryString = window.location.search

    // Parse the query string parameters into an object
    var params = new URLSearchParams(queryString)

    // Get all the values of the 'topic_id' parameter
    var topicIds = params.getAll('topic_id')

    // order asc topic_ids
    topicIds.sort(function (a, b) {
      return a - b
    })

    return topicIds.join('-')
  }

  function init() {
    vocabularies = JSON.parse($('#vocabularies-data').val())

    // get topic_id from params url
    indexKey = getKeyFromParams()
    indexHistory = JSON.parse(localStorage.getItem('currentIndex'))
    if (indexHistory.hasOwnProperty(indexKey)) {
      currentIndex = indexHistory[indexKey]
    }

    if (currentIndex !== undefined) {
      currentIndex = parseInt(currentIndex)
    } else {
      // get first word has flag = true
      for (var i = 0; i < vocabularies.length; i++) {
        if (vocabularies[i].flag) {
          currentIndex = i
          break
        }
      }
    }

    displayWord()
  }

  $('#next-btn').click(function () {
    if (currentIndex + 1 < vocabularies.length) {
      currentIndex += 1
      displayWord()
    }
  })

  $('#prev-btn').click(function () {
    if (currentIndex + 1 > 0) {
      currentIndex -= 1
      displayWord()
    }
  })

  $('#sound-btn').click(function () {
    if (soundOn) {
      soundOn = false
    } else {
      soundOn = true
    }
    checkOnOffButton()
  })

  function clearInput() {
    $('#terminal').val('')
  }

  function showError(incorrect_words) {
    if (incorrect_words.length > 0) {
      $('#incorrect-last').text(incorrect_words.join('; '))
      $('#incorrect-last').removeAttr('hidden')
    } else {
      $('#incorrect-last').attr('hidden', true)
    }
  }

  $('#terminal').on('keydown', function (e) {
    startTimer()
    if (e.shiftKey && e.keyCode == 13) {
      // Shift + Enter key pressed
      var textareaText = $(this).val()
      var caretPos = this.selectionStart
      var textBeforeCaret = textareaText.substring(0, caretPos)
      var textAfterCaret = textareaText.substring(caretPos, textareaText.length)
      $(this).val(textBeforeCaret + '\n' + textAfterCaret)
      // Move the caret to the new line
      this.setSelectionRange(caretPos + 1, caretPos + 1)
      // Prevent the default action of the Enter key (i.e., adding a new line)

      e.preventDefault()
    } else if (e.keyCode == 13 && !e.ctrlKey) {
      e.preventDefault()
      $('#terminal').prop('disabled', true)
      var word = getCurrentWord()
      // Enter key pressed without control key or Shift key
      var textareaText = $(this).val()
      // Do something with the textarea text
      var isCommands = checkCommands(textareaText)
      if (!isCommands) {
        $.ajax({
          // url: '/study/handle_typing/', // Địa chỉ URL của API của bạn
          url: '/v2/study/', // Địa chỉ URL của API của bạn
          method: 'POST', // Phương thức của yêu cầu
          data: { input: textareaText, vocab: word.id }, // Dữ liệu gửi lên máy chủ
          success: function (data) {
            // Xử lý kết quả trả về từ máy chủ
            vocabularies[currentIndex] = data
            displayWord()
            clearInput()
            $('#terminal').prop('disabled', false)
            $('#terminal').focus()
            showError(data.incorect_word_last)
          },
          error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error(error)
            $('#terminal').prop('disabled', false)
            $('#terminal').focus()
            clearInput()
          }
          // Prevent the default action of the Enter key (i.e., adding a new line)
        })
      } else {
        $('#terminal').prop('disabled', true)
      }
    }
  })

  function checkCommands(inputText) {
    var lines = inputText.split('\n')
    var isCommands = false
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (line.startsWith('/pre')) {
        var skipNum = 1
        var tokens = line.split(' ')
        if (tokens.length > 1) {
          skipNum = parseInt(tokens[1])
        }
        currentIndex -= skipNum
        if (currentIndex < 0) {
          currentIndex = 0
        }
        displayWord()
        clearInput()
        resetTimer()
        isCommands = true
      } else if (line.startsWith('/next')) {
        var skipNum = 1
        var tokens = line.split(' ')
        if (tokens.length > 1) {
          skipNum = parseInt(tokens[1])
        }
        currentIndex += skipNum
        if (currentIndex >= vocabularies.length) {
          currentIndex = vocabularies.length - 1
        }
        displayWord()
        clearInput()
        resetTimer()
        isCommands = true
      } else if (line.startsWith('/goto')) {
        let tokens = line.split(' ')
        if (tokens.length > 1) {
          let gotoIndex = parseInt(tokens[1])
          if (gotoIndex > 0 && gotoIndex <= vocabularies.length) {
            currentIndex = gotoIndex - 1
          }
        } else {
          let nextFlagIndex = vocabularies.findIndex((vocabulary, index) => vocabulary.flag === true && index > currentIndex)
          if (nextFlagIndex !== -1) {
            currentIndex = nextFlagIndex
          }
        }
        displayWord()
        clearInput()
        isCommands = true
        resetTimer()
      } else if (line.startsWith('/sound --off')) {
        soundOn = false
        displayWord()
        clearInput()
        isCommands = true
      } else if (line.startsWith('/sound --on')) {
        soundOn = true
        displayWord()
        clearInput()
        isCommands = true
      } else if (line.startsWith('/flag')) {
        let tokens = line.split(' ')
        if (tokens.length > 1) {
          if (tokens[1] === '--on') {
            vocabularies[currentIndex].flag = true
          } else if (tokens[1] === '--off') {
            vocabularies[currentIndex].flag = false
          }
        } else {
          vocabularies[currentIndex].flag = !vocabularies[currentIndex].flag
        }
        displayWord()
        clearInput()
        isCommands = true
      } else if (line.startsWith('/mode')) {
        mode = (mode + 1) % 2
        displayWord()
        clearInput()
        isCommands = true
      } else if (line.startsWith('/pause')) {
        pauseTimer()
        clearInput()
        isCommands = true
      } else if (line.startsWith('/review')) {
        // get all ids params url
        // get the query string from the URL

        // Số 2 đã được lấy thành công, bạn có thể sử dụng biến number ở đây
        // Tạo ra đối tượng URL từ URL hiện tại
        var url = new URL(window.location.href)

        // Thay đổi đường dẫn và các tham số trên URL
        url.pathname = `/review`
        let fromIndex = 0
        let toIndex = vocabularies.length - 1
        let parts = line.split(' ')
        for (let j = 0; j < parts.length; j++) {
          if (parts[j] === '--from' && j + 1 < parts.length) {
            fromIndex = parseInt(parts[j + 1]) - 1
          } else if (parts[j] === '--to' && j + 1 < parts.length) {
            toIndex = parseInt(parts[j + 1]) - 1
          }
        }
        const queryString = window.location.search

        // create a new URLSearchParams object
        const urlParams = new URLSearchParams(queryString)

        // loop through all the query parameters and log their values
        for (const [key, value] of urlParams) {
          url.searchParams.set(key, value)
        }

        url.searchParams.set('from', fromIndex)
        url.searchParams.set('to', toIndex)
        // Chuyển hướng đến URL mới
        window.open(url.toString(), '_blank')

        i = lines.length // break out of the loop
        displayWord()
        clearInput()
        pauseTimer()
        stopInterval()
        isCommands = true
      } else if (line.startsWith('/update') || line.startsWith('/modyfy') || line.startsWith('/edit')) {
        displayEditModal()
        clearInput()
        isCommands = true
      }
    }
    $('a.kanji-link')
      .unbind('click')
      .click(function () {
        var kanji_word = $(this).text()
        showKanjiInfo(kanji_word)
        return false
      })
    return isCommands
  }

  function startTimer() {
    if (timer) {
      return
    }

    if (pausedTime) {
      continueTimer()
      return
    }
    startTime = new Date().getTime()
    timer = setInterval(updateTimer, 10)
  }

  function updateTimer() {
    let currentTime = new Date().getTime()
    let timeElapsed = currentTime - startTime

    let hours = Math.floor(timeElapsed / (1000 * 60 * 60))
    let minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000)

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    let milliseconds = timeElapsed % 1000

    if (milliseconds < 10) {
      milliseconds = '000' + milliseconds
    } else if (milliseconds < 100) {
      milliseconds = '00' + milliseconds
    } else if (milliseconds < 1000) {
      milliseconds = '0' + milliseconds
    }

    $('#timer').text(`${hours}:${minutes}:${seconds}:${milliseconds}`)
    if (minutes < 1 || (minutes < 2 && seconds < 30)) {
      $('#timer').css('background-color', colors.lightGreen).css('color', colors.darkGreen)
    } else if (minutes < 3) {
      $('#timer').css('background-color', colors.lightYellow).css('color', colors.darkYellow)
    } else if (minutes >= 3) {
      $('#timer').css('background-color', colors.lightPink).css('color', colors.darkRed)
    }
  }

  function stopTimer() {
    clearInterval(timer)
  }

  function resetTimer() {
    stopTimer()
    timer = null
    $('#timer').text('00:00:00:0000')
    $('#timer').css('background-color', colors.lightGreen).css('color', colors.darkGreen)
  }

  function pauseTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
      pausedTime = new Date().getTime()
    }
  }

  function continueTimer() {
    if (!timer && pausedTime) {
      startTime += new Date().getTime() - pausedTime
      timer = setInterval(updateTimer, 10)
      pausedTime = null
    }
  }

  $.get(
    '/my_pdf_view/',
    function (data) {
      // Success callback function
      // 'data' variable contains the PDF file
      // Insert the PDF file into an <embed> element
      $('embed').attr('src', 'data:application/pdf;base64,' + data)
    },
    'base64'
  )

  function displayEditModal() {
    var currentWord = getCurrentWord()
    editModal.find('#edit-vocabulary-word').val(currentWord.word)
    editModal.find('#edit-vocabulary-pronunciation').val(currentWord.pronunciation)
    editModal.find('#edit-vocabulary-kanji').val(currentWord.kanji)
    editModal.find('#edit-vocabulary-parts-of-speech').val(currentWord.parts_of_speech)

    for (let i = 0; i < currentWord.refer_patterns.length; i++) {
      var newOption = $('<option></option>')
      newOption.attr('value', currentWord.refer_patterns[i])
      newOption.text(currentWord.refer_patterns[i])
      editModal.find('#edit-vocabulary-romaji').append(newOption)
    }

    if (!currentWord.refer_patterns.includes(currentWord.romaji)) {
      editModal.find('#edit-vocabulary-romaji').append(currentWord.romaji)
    }

    if (!currentWord.romaji || currentWord.romaji === 'new') {
      editModal.find('#edit-vocabulary-romaji').val('new')
      var newInput = $('<input type="text" class="form-control" id="new-romaji-option" name="new_romaji" placeholder="Enter new romaji" required>')
      editModal.find('#edit-vocabulary-romaji').after(newInput)
    } else {
      editModal.find('#edit-vocabulary-romaji').val(currentWord.romaji)
    }

    editModal.find('#edit-vocabulary-romaji').on('change', function () {
      var selectValue = $(this).val()
      var existingInput = editModal.find('#new-romaji-option')
      if (existingInput) {
        existingInput.remove()
      }

      if (selectValue === 'new') {
        var newInput = $('<input type="text" class="form-control" id="new-romaji-option" name="new_romaji" placeholder="Enter new romaji" style="margin-top:5px" required>')
        editModal.find('#edit-vocabulary-romaji').after(newInput)
      }
    })

    editModal.find('#edit-vocabulary-meaning').val(currentWord.meaning)
    editModal.find('#edit-vocabulary-note').val(currentWord.note)
    var examples = currentWord.examples ? currentWord.examples.join(',') : ''
    var synonyms = currentWord.synonyms ? currentWord.synonyms.join(',') : ''
    var antonyms = currentWord.antonyms ? currentWord.antonyms.join(',') : ''
    var referPatterns = currentWord.refer_patterns ? currentWord.refer_patterns.join(',') : ''
    editModal.find('#edit-vocabulary-examples').tagsinput('add', examples)
    editModal.find('#edit-vocabulary-synonyms').tagsinput('add', synonyms)
    editModal.find('#edit-vocabulary-antonyms').tagsinput('add', antonyms)
    editModal.find('#edit-vocabulary-refer-patterns').tagsinput('add', referPatterns)

    editModal.find('#edit-vocabulary-examples').attr('value', examples)
    editModal.find('#edit-vocabulary-synonyms').attr('value', synonyms)
    editModal.find('#edit-vocabulary-antonyms').attr('value', antonyms)
    editModal.find('#edit-vocabulary-refer-patterns').attr('value', referPatterns)

    editModal
      .find(
        '#edit-vocabulary-examples, \
                    #edit-vocabulary-synonyms, \
                    #edit-vocabulary-antonyms, \
                    #edit-vocabulary-refer-patterns'
      )
      .on('itemAdded', function (event) {
        var items = $(this).tagsinput('items')
        if (!items) {
          items = []
        }
        $(this).attr('value', items.join(','))
      })
      .on('itemRemoved', function (event) {
        var items = $(this).tagsinput('items')
        if (!items) {
          items = []
        }
        $(this).attr('value', items.join(','))
      })
    editModal.find('#edit-vocabulary-image-url').val(currentWord.image_url)
    editModal.find('#edit-vocabulary-flag').prop('checked', currentWord.flag)
    editModal.find('#edit-vocabulary-not-review-if-null').prop('checked', currentWord.uncheck_ifnull)
    editModal.find('#edit-vocabulary-id').val(currentWord.id)
    editModal.find('#edit-vocabulary-topic-id').val(currentWord.topic)
    editModal.find('#edit-vocabulary-sino-viet').val(currentWord.sino_viet)
    editModal.find('#edit-vocabulary-vietnamese').val(currentWord.vietnamese)

    if (currentWord.lang === 'JA') {
      editModal.find('#language-jp-container').show()
      editModal.find('#language-other-container').hide()
    } else {
      editModal.find('#language-jp-container').hide()
      editModal.find('#language-other-container').show()
    }

    editModal.find('#edit-vocabulary-auto-update-kanji').change(function () {
      if ($(this).is(':checked')) {
        editModal.find('#edit-vocabulary-kanji').prop('disabled', true)
      } else {
        editModal.find('#edit-vocabulary-kanji').prop('disabled', false)
      }
    })

    editModal.find('#edit-vocabulary-auto-update-sino-viet').change(function () {
      if ($(this).is(':checked')) {
        editModal.find('#edit-vocabulary-sino-viet').prop('disabled', true)
      } else {
        editModal.find('#edit-vocabulary-sino-viet').prop('disabled', false)
      }
    })

    editModal.modal('show')
  }

  init()
})
