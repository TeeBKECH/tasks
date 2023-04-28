const inputEl = document.querySelector('input')
const buttonEl = document.querySelector('button')
const timerEl = document.querySelector('span')

// Напишите реализацию createTimerAnimator
// который будет анимировать timerEl
const createTimerAnimator = () => {
  return (seconds) => {
    const showTimer = (sec) => {
      // Рассчитываем значения для часов, минут и секунд
      let hours = Math.floor(sec / 3600).toString()
      let minutes = Math.floor(sec / 60 - hours * 60).toString()
      let scnds = (sec - Math.floor(sec / 60) * 60).toString()

      // форматируем вывод под двухзначные числа
      hours = hours.length < 2 ? '0' + hours : hours
      minutes = minutes.length < 2 ? '0' + minutes : minutes && minutes > 59 ? '00' : minutes
      scnds = scnds.length < 2 ? '0' + scnds : scnds

      // Вставляем в тег span значения
      timerEl.innerText = `${hours}:${minutes}:${scnds}`
    }

    // Вызываем функцию первый раз, чтобы визуально отразить таймер в нужном нам формате времени
    showTimer(seconds)

    // Создаем таймер с помощью setInterval и вызываем функцию showTimer каждую секунду.
    // Если секунды равны 0, то очищаем интервал
    const timer = setInterval(() => {
      if (seconds) return showTimer(--seconds)
      return clearInterval(timer)
    }, 1000)
  }
}

const animateTimer = createTimerAnimator()

inputEl.addEventListener('input', (e) => {
  // Запрещаем ввод символов кроме цифр
  e.target.value = e.target.value.replace(/[^\d]/g, '')
  // Очистите input так, чтобы в значении
  // оставались только числа
})

buttonEl.addEventListener('click', () => {
  const seconds = Number(inputEl.value)

  animateTimer(seconds)

  inputEl.value = ''
})
