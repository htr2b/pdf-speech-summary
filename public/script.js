// script.js

window.addEventListener('DOMContentLoaded', () => {
  // Elemanlar
  const incomingTextEl = document.getElementById('incomingText')
  const audioUpload = document.getElementById('audioUpload')
  const summarizeBtn = document.getElementById('summarizeButton') // sadece özetle
  const summaryEl = document.getElementById('summary')
  const convertBtn = document.getElementById('convertButton')   // TTS
  const playBtn = document.getElementById('playButton')      // play
  const audioSection = document.getElementById('audioSection')
  const audioPlayer = document.getElementById('audioPlayer')

  let transcriptText = ''
  let summaryText = ''
  let audioUrl = ''

  // 1) Dosya seçildiğinde otomatik transcribe et
  audioUpload.addEventListener('change', async () => {
    const file = audioUpload.files[0]
    if (!file) return

    // Kullanıcıya geri bildirim
    incomingTextEl.value = 'Transkript çıkarılıyor…'
    summarizeBtn.disabled = true
    summaryEl.value = ''
    convertBtn.disabled = true
    playBtn.disabled = true

    try {
      const formData = new FormData()
      formData.append('audio', file) // backend upload.single('file')

      const res = await fetch('http://localhost:3000/speech/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || res.statusText)

      transcriptText = data.transcript
      incomingTextEl.value = transcriptText
      summarizeBtn.disabled = false  // özetleme adımını aç

    } catch (err) {
      console.error('Transkript hatası:', err)
      incomingTextEl.value = ''
      alert('Transkript hatası: ' + err.message)
    }
  })

  // 2) METİN → ÖZET
  summarizeBtn.addEventListener('click', async () => {
    if (!transcriptText) return alert('Önce transkript alın.')

    summarizeBtn.disabled = true
    summarizeBtn.textContent = 'Özetleniyor…'
    summaryEl.value = ''
    convertBtn.disabled = true
    playBtn.disabled = true

    try {
      const res = await fetch('http://localhost:3000/speech/summary')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || res.statusText)

      summaryText = data.summary
      summaryEl.value = summaryText
      convertBtn.disabled = false

    } catch (err) {
      console.error('Özet hatası:', err)
      alert('Özet hatası: ' + err.message)
    } finally {
      summarizeBtn.disabled = false
      summarizeBtn.textContent = 'Gelen metni özetle'
    }
  })

  // 3) ÖZET → SES (TTS)
  convertBtn.addEventListener('click', async () => {
    if (!summaryText) return alert('Önce özet oluşturun.')

    convertBtn.disabled = true
    convertBtn.textContent = 'Ses oluşturuluyor…'
    playBtn.disabled = true

    try {
      const res = await fetch('http://localhost:3000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || res.statusText)

      audioUrl = `http://localhost:3000${data.url}`
      playBtn.disabled = false

    } catch (err) {
      console.error('TTS hatası:', err)
      alert('TTS hatası: ' + err.message)
    } finally {
      convertBtn.disabled = false
      convertBtn.textContent = '🔁 Özetlenen metni sese çevir'
    }
  })

  // 4) SESİ OYNAT
  playBtn.addEventListener('click', async () => {
    if (!audioUrl) return alert('Önce sese çevirin.')

    audioSection.hidden = false
    audioPlayer.src = audioUrl
    try {
      await audioPlayer.play()
    } catch (err) {
      console.error('Oynatma hatası:', err)
      alert('Ses oynatılamadı: ' + err.message)
    }
  })

  // Global audio error handler
  audioPlayer.onerror = () => {
    console.error('Audio player hatası:', audioPlayer.error)
    alert('Ses yüklenirken hata oluştu: ' +
      (audioPlayer.error?.message || 'Bilinmeyen hata'))
  }
})
