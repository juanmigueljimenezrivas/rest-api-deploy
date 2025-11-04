const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./Schema/movies')

const app = express()
app.disable('x-powered-by')

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    if (!origin) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  }
}))

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE
// CORS PRE-Flight
// OPTIONS

// Captura request, para poder acceder al req.body
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'hola mundo' })
})
/*
const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://movies.com',
  'https://midu.dev'
]
*/
app.get('/movies', (req, res) => {
  /*
    // Esta cabecera no siempre te la manda el navegador,
  // Cuando la petición es del mismo ORIGIN
  // http://localhost:1234 --> http://localhost:1234
  const origin = req.header('origin')
  // Normalmente se coge el id y se ve lo que se hace
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
    */
  // Recogemos los query params
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// En el POST, la id la creamos nosotros, creado desde 0
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  // result.success
  if (result.error) {
    // Se podía utilizar el 422 (Unprocessable Entity) también
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }

  // if(!title || !genre || !year || !director ){
  // }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // Esto NO SERÍA REST, porque estamos guardando
  // El estado de la aplicación en memoria
  movies.push(newMovie)
  res.send(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie

  res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  res.json({ message: 'Movie deleted' })
})

// Segmento dinámico que identifica la película
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

app.get('/movies?:genre')

/*
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  // Normalmente se coge el id y se ve lo que se hace
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    console.log('Entro aquí', origin || '*')
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE')
  }
  res.send(200)
})
*/
//Variables de entorno siempre en mayúscula
const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server escuchando en puerto http://localhost:${PORT}`)
})
