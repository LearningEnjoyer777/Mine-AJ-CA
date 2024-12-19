import {
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
} from "./minesweeper.js"

const difficulties = {
  easy: { boardSize: 4, numberOfMines: 2 },
  normal: { boardSize: 8, numberOfMines: 14 },
  hard: { boardSize: 12, numberOfMines: 32 },
  custom: { boardSize: 10, numberOfMines: 5 }, 
}


let BOARD_SIZE = difficulties.easy.boardSize
let NUMBER_OF_MINES = difficulties.easy.numberOfMines
const INITIAL_LIVES = 3
let lives = INITIAL_LIVES

const difficultySelect = document.getElementById("difficulty")

difficultySelect.value = "easy"

difficultySelect.addEventListener("change", (e) => {
  const difficulty = e.target.value
  if (difficulty === "custom") {
    
    BOARD_SIZE = parseInt(prompt("Enter board size:", 10))
    NUMBER_OF_MINES = parseInt(prompt("Enter number of mines:", 5))
  } else {
    BOARD_SIZE = difficulties[difficulty].boardSize
    NUMBER_OF_MINES = difficulties[difficulty].numberOfMines
  }
  startGame()
})

const newGameButton = document.getElementById("new-game")
newGameButton.addEventListener("click", () => {
  newGameButton.style.display = "none"
  startGame()
})

function startGame() {
  lives = INITIAL_LIVES
  const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES)
  const boardElement = document.querySelector(".board")
  boardElement.innerHTML = "" 
  const minesLeftText = document.querySelector("[data-mine-count]")
  const messageText = document.querySelector(".subtext")

  
  messageText.textContent = ""

  
  const existingLivesText = document.querySelector(".lives-counter")
  if (existingLivesText) {
    existingLivesText.remove()
  }

  
  boardElement.replaceWith(boardElement.cloneNode(true))
  const newBoardElement = document.querySelector(".board")

  const livesText = document.createElement("div")
  livesText.classList.add("subtext", "lives-counter")
  livesText.textContent = `Lives: ${lives}`
  document.body.insertBefore(livesText, newBoardElement)

  board.forEach(row => {
    row.forEach(tile => {
      newBoardElement.append(tile.element)
      tile.element.addEventListener("click", () => {
        revealTile(board, tile)
        checkGameEnd(board, tile)
      })
      tile.element.addEventListener("contextmenu", e => {
        e.preventDefault()
        markTile(tile)
        listMinesLeft()
      })
    })
  })
  newBoardElement.style.setProperty("--size", BOARD_SIZE)
  minesLeftText.textContent = NUMBER_OF_MINES

  function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
      return (
        count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
      )
    }, 0)

    minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount
  }

  function checkGameEnd(board, tile) {
    const win = checkWin(board)
    const lose = tile.status === TILE_STATUSES.MINE

    if (win) {
      messageText.textContent = "You Win"
      board.forEach(row => {
        row.forEach(tile => {
          if (tile.mine && tile.status !== TILE_STATUSES.MARKED) {
            revealTile(board, tile)
          }
        })
      })
      newBoardElement.addEventListener("click", stopProp, { capture: true })
      newBoardElement.addEventListener("contextmenu", stopProp, { capture: true })
      newGameButton.style.display = "block"
    }

    if (lose) {
      lives -= 1
      livesText.textContent = `Lives: ${lives}`
      if (lives === 0) {
        messageText.textContent = "You Lose"
        board.forEach(row => {
          row.forEach(tile => {
            if (tile.status === TILE_STATUSES.MARKED) markTile(tile)
            if (tile.mine) revealTile(board, tile)
          })
        })
        newBoardElement.addEventListener("click", stopProp, { capture: true })
        newBoardElement.addEventListener("contextmenu", stopProp, { capture: true })
        newGameButton.style.display = "block"
      } else {
        messageText.textContent = `You hit a mine! Lives left: ${lives}`
        tile.status = TILE_STATUSES.HIDDEN
      }
    }
  }

  function stopProp(e) {
    e.stopImmediatePropagation()
  }
}


startGame()