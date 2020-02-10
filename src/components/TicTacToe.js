import React from 'react'
import './TicTacToe.css'
import _ from 'lodash'
import moment from 'moment'

const selectionColor = 'red'
const winGridColor = 'green'

function GridBlock(props) {
  const { value, handleClick, bgGround } = props
  return (<div className='box' style={{ backgroundColor: bgGround }} onClick={handleClick}>
    {value}
  </div>)
}

function GridBlockCenter(props) {
  const { value, handleClick, handleReset, bgGround, timer } = props
  return (<div className='boxCenter' style={{ backgroundColor: bgGround }} onClick={handleClick}>
    <button className='resetButton' onClick={(e) => { e.stopPropagation(); handleReset() }}>Reset</button>
    <span className='timerText'>{timer}</span>
    {value}
  </div>)
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gridMarker: Array(9).fill(null),
      gridColor: Array(9).fill(''),
      IsUserTurn: true,
      gameStarted: false,
      gameStartedOn: 0,
      gameFinished: false,
      gameFinishedOn: 0,
      timerText: '',
      winMovesX: [],
      winMovesO: []
    }
  }

  handleGridClick(value) {
    const { gridMarker, gridColor, gameStarted, gameFinished, IsUserTurn } = this.state

    if (gameFinished) {
      alert('Game has finished, reset to play again')
      return
    }

    if (!IsUserTurn) {
      alert('Wait for your turn')
      return
    }

    if (!gameStarted) {
      this.setState({
        gameStarted: true,
        gameStartedOn: Date.now()
      })
    }

    if (gridMarker[value] !== null) {
      return
    }
    gridMarker[value] = 'X'
    gridColor[value] = selectionColor
    this.setState({ gridMarker: gridMarker, gridColor: gridColor, IsUserTurn: false }, () => this.checkWinner(gridMarker))
  }

  componentDidMount() {
    setInterval(() => {
      let txt = ''
      if (this.state.gameStarted && !this.state.gameFinished) {
        txt = moment.utc(Date.now() - this.state.gameStartedOn).format('mm:ss');
      }

      if (this.state.gameFinished && this.state.gameStarted) {
        txt = moment.utc(this.state.gameFinishedOn - this.state.gameStartedOn).format('mm:ss')
      }

      this.setState({ timerText: txt })
    }, 1000)
  }

  handleComputerMove() {
    if (this.state.IsUserTurn) {
      return
    }
    setTimeout(() => {
      const { winMovesX, winMovesO, gridMarker, gridColor } = this.state
      if (winMovesO.length) { // win first
        gridMarker[winMovesO[0]] = 'O'
        gridColor[winMovesO[0]] = selectionColor
      } else if (winMovesX.length) { // prevent defeat
        gridMarker[winMovesX[0]] = 'O'
        gridColor[winMovesX[0]] = selectionColor
      } else if (gridMarker[0] === 'X' && gridMarker[8] === 'X') { // future attack prevention priority x-axis
        const optimalMovePos = [7, 2, 6]
        let blocked = false
        optimalMovePos.forEach((e) => {
          if (gridMarker[e] === null && blocked === false) {
            gridMarker[e] = 'O'
            gridColor[e] = selectionColor
            blocked = true
          }
        })
      } else if (gridMarker[2] === 'X' && gridMarker[6] === 'X') { // future attack prevention priority y-axis
        const optimalMovePos = [1, 8, 0]
        let blocked = false
        optimalMovePos.forEach((e) => {
          if (gridMarker[e] === null && blocked === false) {
            gridMarker[e] = 'O'
            gridColor[e] = selectionColor
            blocked = true
          }
        })
      } else { // fall back to optimal moves
        const optimalMovePos = [4, 0, 2, 6, 8]
        let blocked = false
        optimalMovePos.forEach((e) => {
          if (gridMarker[e] === null && blocked === false) {
            gridMarker[e] = 'O'
            gridColor[e] = selectionColor
            blocked = true
          }
        })

        if (!blocked) {
          const movePos = gridMarker.indexOf((e) => e == null)
          gridMarker[movePos] = 'O'
          gridColor[movePos] = selectionColor
        }
      }
      this.setState({ gridMarker: gridMarker, gridColor: gridColor, IsUserTurn: true }, () => this.checkWinner(gridMarker))
    }, 750)
  }

  handleGameEnd(result) {
    if (result === 'Draw') {
      // alert('nobody won')
    } else if (result === 'X') {
      // alert('user won')
    } else if (result === 'O') {
      //alert('Computer won')
    }
    this.setState({ gameFinished: true, gameFinishedOn: Date.now() })
  }

  renderGridBlock(value) {
    return (<GridBlock value={this.state.gridMarker[value]} bgGround={this.state.gridColor[value]} handleClick={() => { this.handleGridClick(value) }} />)
  }

  renderGridBlockCenter(value) {
    return (<GridBlockCenter value={this.state.gridMarker[value]} bgGround={this.state.gridColor[value]} timer={this.state.timerText} handleClick={() => { this.handleGridClick(value) }} handleReset={() => { this.handleGameReset() }} />)
  }

  checkWinner(gridMarker) {
    const winSets = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]
    let result = null
    const { gridColor } = this.state
    const winMovesO = []; const winMovesX = []
    winSets.forEach((set, index) => {
      if (gridMarker[set[0]] && gridMarker[set[0]] === gridMarker[set[1]] && gridMarker[set[0]] === gridMarker[set[2]]) {
        result = gridMarker[set[0]]
        set.forEach((el) => {
          gridColor[el] = winGridColor
        })
        this.setState({ gridColor: gridColor })
      } else {
        const symb = [gridMarker[set[0]], gridMarker[set[1]], gridMarker[set[2]]]
        let nullPos = 0

        const symbCount = _.countBy(symb)

        if (symbCount.null === 1) {
          nullPos = set[symb.findIndex((e) => e === null)]

          if (symbCount.X === 2) {
            winMovesX.push(nullPos)
          }

          if (symbCount.O === 2) {
            winMovesO.push(nullPos)
          }

          this.setState({ winMovesX: winMovesX, winMovesO: winMovesO })
        }
      }
    })

    result ? this.handleGameEnd(result) : gridMarker.includes(null) ? this.handleComputerMove() : this.handleGameEnd('Draw')
  }

  handleGameReset() {
    this.setState({
      gridMarker: Array(9).fill(null),
      gridColor: Array(9).fill(''),
      IsUserTurn: true,
      gameStarted: false,
      gameStartedOn: 0,
      gameFinished: false,
      gameFinishedOn: 0,
      timerText: '',
      winMovesX: [],
      winMovesO: []
    })
  }

  render() {
    return (
      <div className="game-board">
        {this.renderGridBlock(0)}
        {this.renderGridBlock(1)}
        {this.renderGridBlock(2)}
        {this.renderGridBlock(3)}
        {this.renderGridBlockCenter(4)}
        {this.renderGridBlock(5)}
        {this.renderGridBlock(6)}
        {this.renderGridBlock(7)}
        {this.renderGridBlock(8)}
      </div>

    )
  }
}

export default Game
