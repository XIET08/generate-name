document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button')
  const input = document.getElementById('englishName')

  // 添加回车键提交功能
  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      button.click()
    }
  })

  // 添加显示提示框的函数
  function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.classList.add('show')

    setTimeout(() => {
      toast.classList.remove('show')
    }, duration)
  }

  button.addEventListener('click', async function () {
    const englishName = document.getElementById('englishName').value
    if (!englishName) {
      showToast('Please enter your English name')
      return
    }

    // 添加 loading 状态
    button.classList.add('loading')
    button.disabled = true

    const resultsDiv = document.getElementById('results')
    resultsDiv.innerHTML =
      '<div class="generating-message">Generating names...</div>'

    try {
      const response = await fetch('/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ englishName })
      })

      const data = await response.json()

      if (data.error) {
        resultsDiv.innerHTML = `<p class="generating-message" style="color: red;">Error: ${data.error}</p>`
        return
      }

      // 解析返回的名字数据
      const { names } = data

      resultsDiv.innerHTML = names
        .map(({ chinese, chineseMeaning, englishMeaning }) => {
          return `
            <div class="name-card">
                <h3>${chinese}</h3>
                <p><strong>中文含义：</strong>${chineseMeaning}</p>
                <p><strong>English Meaning：</strong>${englishMeaning}</p>
            </div>
          `
        })
        .join('')
    } catch (error) {
      resultsDiv.innerHTML = `<p style="color: red;">Error: Could not generate names. Please try again.</p>`
    } finally {
      // 移除 loading 状态
      button.classList.remove('loading')
      button.disabled = false
    }
  })
})
