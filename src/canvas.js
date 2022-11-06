import { Renderer, Camera, Transform, Texture, Program, Plane, Mesh, RenderTarget, TextureLoader } from 'ogl'
import { N } from './utils/namhai'
import BasicFrag from './shaders/BasicFrag.glsl?raw'
import BasicVer from './shaders/BasicVer.glsl?raw'

export default class Canvas {
  constructor() {
    this.renderer = new Renderer({
      alpha: true
    })
    this.gl = this.renderer.gl

    document.body.appendChild(this.gl.canvas)

    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
    this.scene = new Transform()

    this.scroll = {
      current: 0,
      target: 0,
      velo: 0
    }

    this.onResize()



    N.BM(this, ['update', 'onScroll'])

    const images = N.getAll('img')
    this.gallery = []
    Object.keys(images).forEach(index => {
      this.createSprite(index, images[index])
    })
    this.gallery[1].scale.y = 0
    this.galleryBounds = N.get('.gallery').getBoundingClientRect().width * this.size.width / this.sizePixel.width

    this.raf = new N.RafR(this.update)
    this.raf.run()

    this.addEventListener()
  }
  addEventListener() {
    // document.addEventListener('wheel', this.onScroll)
  }

  onScroll(e) {
    this.scroll.target += e.deltaY / 100
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.sizePixel = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.camera.perspective({
      aspect: this.sizePixel.width / this.sizePixel.height
    })
    const fov = this.camera.fov * Math.PI / 180

    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.size = {
      height: height,
      width: height * this.camera.aspect
    }

  }

  update() {

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    })

  }

  createSprite(index, img) {
    let texture = new Texture(this.gl)
    let image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.src = N.Ga(img, 'data-src')
    image.onload = () => {
      texture.image = image
    }

    const bounds = img.getBoundingClientRect()

    let program = new Program(this.gl, {
      fragment: BasicFrag,
      vertex: BasicVer,
      depthTest: false,
      uniforms: {
        tMap: {
          value: texture
        },
        scale: {
          value: [1, bounds.width / bounds.height]
        },
        translate: {
          value: [0, 0]
        }
      }
    })

    let geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 20
    })
    this.gallery.push(new Mesh(this.gl, {
      geometry,
      program
    }))

    this.gallery[index].setParent(this.scene)
    this.gallery[index].scale.x = bounds.width * this.size.width / this.sizePixel.width
    this.gallery[index].scale.y = bounds.height * this.size.height / this.sizePixel.height

    this.gallery[index].position.x = bounds.x * this.size.width / this.sizePixel.width - this.size.width / 2 + this.gallery[index].scale.x / 2
  }

  anime() {
    console.log('fsd');
    const boundsPixel = N.get('img').getBoundingClientRect()
    const bounds = {
      w: boundsPixel.width * this.size.width / this.sizePixel.width,
      h: boundsPixel.height * this.size.height / this.sizePixel.height
    }


    let tl = new N.TL()
    tl.from({
      d: 1000,
      e: 'io4',
      update: t => {

        // mesh qui est visible au debut et qui se cache
        this.gallery[0].scale.y = bounds.h * (1 - t.progE)
        this.gallery[0].position.y = -bounds.h / 2 + bounds.h * (1 - t.progE) / 2

        this.gallery[0].program.uniforms.scale.value = [1, (bounds.w / bounds.h) / (1 - t.progE)]
        this.gallery[0].program.uniforms.translate.value = [0, (- t.progE / 2) / (bounds.w / bounds.h)]

        // mesh qui apparait
        this.gallery[1].scale.y = bounds.h * t.progE
        this.gallery[1].position.y = bounds.h / 2 - bounds.h * (t.progE) / 2

        this.gallery[1].program.uniforms.scale.value = [1, (bounds.w / bounds.h) / t.progE]
        this.gallery[1].program.uniforms.translate.value = [0, (0.5 - t.progE / 2) / (bounds.w / bounds.h)]
      }
    })

    tl.play()
  }
}
