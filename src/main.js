import Canvas from './canvas'
import './style.scss'
import { N } from './utils/namhai'

class App {
  constructor() {

    this.canvas = new Canvas()
    this.addEventListener()
  }
  addEventListener() {

    N.get('.gallery').addEventListener('click', _ => {
      this.canvas.anime()
    })
  }
}
new App()
