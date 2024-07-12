const SNAKE_CELL_SIZE = 25; // Размер ячейки змейки
const SNAKE_COLOR = '#555'; // Цвет тела змеи
// Получаем из DOM элементы управления и обертку для канваса
const root = document.getElementById("canvas_wrapper");
const startAndPauseButton = document.getElementById("start_game_button");
const stopButton = document.getElementById("stop_game_button");
const speedSelector = document.getElementById("speed_select");
const canvas = document.createElement("canvas"); // Создаем канвас
const ctx = canvas.getContext("2d"); // Получаем контекст канваса
canvas.width = root.offsetWidth;
canvas.height = root.offsetHeight;
root.appendChild(canvas);
let prey = getNewPrey(); // Объект с данными жертвы
let preyColor = getRandomColor(); // Цвет жертвы
let snakeBody = [{ x: 0, y: 0 }]; // Тело змеи
let direction = 'right'; // Направление движения
let gameState = 'stop'; // Состояние игры - запущена, на паузе, прекращена
let intervalId; // id интервала для управления циклом игры
let gameSpeed = 200; // Скорость обновления цикла игры - скорость передвижения змеи
// Возвращает случайное число в заданном диапазоне
function getRandomNumber(min, max) {
    const n = Math.floor(Math.random() * (max - min) + min);
    return Math.round(n / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
}
// Очищает канвас
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
// Возвращает случайный цвет
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// Возвращает массив из двух случайных чисел - координаты жертвы
function getNewPreyCoords() {
    return [getRandomNumber(0, canvas.width - SNAKE_CELL_SIZE), getRandomNumber(0, canvas.height - SNAKE_CELL_SIZE)];
}
// Возвращает объект жертвы
function getNewPrey() {
    return { color: getRandomColor(), coords: getNewPreyCoords() };
}
// Главный цикл игры. Запускается в интервале и проверяет состояние змейки и передвигает ее по канвасу
function gameLoop() {
    clearCanvas();
    ctx.fillStyle = prey.color; // Окрашиваем жертву в случайный цвет
    ctx.fillRect(...prey.coords, SNAKE_CELL_SIZE, SNAKE_CELL_SIZE); //Рисуем жертву
    // Проверка на столкновение головы со своим хвостом
    snakeBody.forEach((coord, ind) => {
        if (coord.x == snakeBody[snakeBody.length - 1].x && coord.y == snakeBody[snakeBody.length - 1].y && ind < snakeBody.length - 1) {
            gameState = 'stop';
            snakeBody = [{ x: 0, y: 0 }];
            direction = 'right';
        }
    });
    const snakeTail = Object.assign({}, snakeBody[0]);
    const snakeHead = Object.assign({}, snakeBody[snakeBody.length - 1]);
    // Присвоение голове змеи новых координат (движение)
    switch (direction) {
        case 'right':
            snakeHead.x = snakeHead.x + SNAKE_CELL_SIZE;
            snakeHead.y = Math.round(snakeHead.y / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
            break;
        case 'up':
            snakeHead.y = snakeHead.y - SNAKE_CELL_SIZE;
            snakeHead.x = Math.round(snakeHead.x / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
            break;
        case 'left':
            snakeHead.x = snakeHead.x - SNAKE_CELL_SIZE;
            snakeHead.y = Math.round(snakeHead.y / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
            break;
        case 'down':
            snakeHead.x = Math.round(snakeHead.x / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
            snakeHead.y = snakeHead.y + SNAKE_CELL_SIZE;
            break;
    }
    // Передвижение происходит за счет перемещения хвоста на место головы
    snakeBody.push(snakeHead);
    snakeBody.splice(0, 1);
    snakeBody.forEach((snakeBodySegment, ind) => {
        // Проверка на выход за пределы канваса
        switch (direction) {
            case 'right':
                if (snakeBodySegment.x > Math.round(canvas.width / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE)
                    snakeBodySegment.x = 0;
                break;
            case 'up':
                if (snakeBodySegment.y < 0)
                    snakeBodySegment.y = Math.round(canvas.height / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
                break;
            case 'left':
                if (snakeBodySegment.x < 0)
                    snakeBodySegment.x = Math.round(canvas.width / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE;
                break;
            case 'down':
                if (snakeBodySegment.y > Math.round(canvas.height / SNAKE_CELL_SIZE) * SNAKE_CELL_SIZE)
                    snakeBodySegment.y = 0;
                break;
        }
        // Проверка факта "съедания" змеей жертвы
        if (snakeBodySegment.x == prey.coords[0] && snakeBodySegment.y == prey.coords[1]) {
            prey = getNewPrey();
            snakeBody.unshift({ x: snakeHead.x - SNAKE_CELL_SIZE, y: snakeTail.y });
        }
        // Отрисовываем тело змеи. Голову красим в красный 
        ctx.fillStyle = ind === snakeBody.length - 1 ? 'tomato' : SNAKE_COLOR; // Задаем цвет змеи. Голову красим в красный
        ctx.fillRect(snakeBodySegment.x, snakeBodySegment.y, SNAKE_CELL_SIZE, SNAKE_CELL_SIZE);
    });
}
// Добавляем слушатели на кнопки клавиатуры
document.addEventListener('keydown', ev => {
    ev.stopPropagation();
    if (ev.code === 'ArrowRight' && direction !== 'left')
        direction = 'right';
    if (ev.code === 'ArrowUp' && direction !== 'down')
        direction = 'up';
    if (ev.code === 'ArrowLeft' && direction !== 'right')
        direction = 'left';
    if (ev.code === 'ArrowDown' && direction !== 'up')
        direction = 'down';
});
// Добавляем слушатели на кнопки Старт/Пауза Стоп
startAndPauseButton.onclick = () => {
    if (gameState !== 'start') {
        gameState = 'start';
        intervalId = setInterval(gameLoop, gameSpeed);
        startAndPauseButton.innerText = 'Пауза';
    }
    else {
        clearInterval(intervalId);
        gameState = 'pause';
        startAndPauseButton.innerText = 'Старт';
    }
};
stopButton.onclick = () => {
    clearInterval(intervalId);
    clearCanvas();
    gameState = 'stop';
    snakeBody = [{ x: 0, y: 0 }];
    direction = 'right';
    prey = getNewPrey();
    startAndPauseButton.innerText = 'Старт';
};
// Добавлеям слушатель на селект скорости
speedSelector.onchange = ({ target }) => {
    gameSpeed = +target.value * 100;
    speedSelector.blur();
    if (gameState === 'start') {
        clearInterval(intervalId);
        intervalId = setInterval(gameLoop, gameSpeed);
    }
};
