import { useState, useEffect } from 'react'

// Функция для добавления в начало символа "0", если кол-во символов в строке меньше 2
const getPad = (value) => value.toString().padStart(2, '0')

function App() {
  // Стейт для хранения значения из инпута (управляемый инпут)
  const [value, setValue] = useState('')

  // Флаг для контроля запуска и остановки таймера
  const [started, setStarted] = useState(false)

  // Стейты для хранения всех секунд, и форматированных значний часов, минут  и секунд
  const [seconds, setSeconds] = useState(0)
  const [ss, setSs] = useState('00')
  const [mm, setMm] = useState('00')
  const [hh, setHh] = useState('00')

  // Функция, которая пересчитывает значение времени в зависимости от полученного аргумента (секунд)
  const getTime = (sec) => {
    setHh(getPad(Math.floor(sec / 3600)))
    setMm(getPad(Math.floor(sec / 60 - Math.floor(sec / 3600) * 60)))
    setSs(getPad(sec - Math.floor(sec / 60) * 60))
  }

  // Хэндлер для работы с вводом в инпут (защита от ввода символов, отличных от цифр)
  const inputHandler = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '')
    setValue(val)
  }

  // Хэндлер для работы с кнопкой (записываем стартовые данные в стейты и сбрасываем значение инпута)
  const buttonHandler = () => {
    if (!value) return
    setStarted(true)
    setSeconds(Number(value) - 1)
    getTime(Number(value))
    setValue('')
  }

  useEffect(() => {
    // Создаем интервал
    const interval = setInterval(() => {
      // Понижмаем значение секунд на 1 после каждой итерации
      setSeconds((prev) => (prev >= 1 ? prev - 1 : 0))
      if (started) {
        getTime(seconds)
        return
      }
    }, 1000)

    // Если секунды дошли до 0, устанавливаем флаг в положение false и таймер останавливается
    if (seconds < 0) setStarted(false)

    return () => clearInterval(interval)
  }, [seconds, started])

  return (
    <div className='App'>
      <input
        value={value}
        onChange={inputHandler}
        placeholder='Seconds'
        type='text'
      />

      <button onClick={buttonHandler}>Start</button>

      <br />
      <br />

      <span>
        {hh}:{mm}:{ss}
      </span>

      <br />
      <br />

      <a
        rel='noreferrer'
        href='https://teebkech.github.io/tasks/'
        target='_blank'
      >
        Версия на чистом js
      </a>

      <script src='./index.js'></script>
    </div>
  )
}

export default App
