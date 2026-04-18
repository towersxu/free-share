import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const PLAYLIST = [
  {
    title: 'ASAP',
    artist: 'Lena, Miss Li',
    src: '/free-share/music/Lena Miss Li - ASAP.mp3',
  },
  {
    title: 'The Mass',
    artist: 'Era',
    src: '/free-share/music/Era - The Mass.mp3',
  },
]

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function App() {
  const audioRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)

  const track = PLAYLIST[currentIndex]

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentIndex])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * audio.duration
  }

  const playTrack = (index) => {
    setCurrentIndex(index)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  return (
    <div className="player-app">
      <audio ref={audioRef} src={track.src} preload="metadata" />

      {/* Header */}
      <header className="header">
        <span className="header-icon">🎵</span>
        <h1>Free Share Music</h1>
      </header>

      {/* Now Playing */}
      <div className="now-playing">
        <div className={`disc ${isPlaying ? 'spinning' : ''}`}>
          <div className="disc-inner">♪</div>
        </div>
        <h2 className="track-title">{track.title}</h2>
        <p className="track-artist">{track.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <span className="time-label">{formatTime(currentTime)}</span>
        <div className="progress-bar" onClick={seek}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <div className="progress-thumb" style={{ left: `${progress}%` }} />
        </div>
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="ctrl-btn" onClick={() => playTrack((currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length)} title="上一首">
          ⏮
        </button>
        <button className="ctrl-btn play-btn" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <button className="ctrl-btn" onClick={() => playTrack((currentIndex + 1) % PLAYLIST.length)} title="下一首">
          ⏭
        </button>
      </div>

      {/* Volume */}
      <div className="volume-section">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>

      {/* Playlist */}
      <div className="playlist">
        <h3>播放列表</h3>
        <ul>
          {PLAYLIST.map((t, i) => (
            <li
              key={i}
              className={`playlist-item ${i === currentIndex ? 'active' : ''}`}
              onClick={() => playTrack(i)}
            >
              <span className="playlist-index">{i + 1}</span>
              <span className="playlist-info">
                <span className="playlist-title">{t.title}</span>
                <span className="playlist-artist">{t.artist}</span>
              </span>
              {i === currentIndex && isPlaying && <span className="playing-indicator">♫</span>}
            </li>
          ))}
        </ul>
      </div>

      <footer className="footer">
        <p>音乐来源于本地硬盘 · Free Share</p>
      </footer>
    </div>
  )
}

export default App
