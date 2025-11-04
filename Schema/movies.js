const z = require('zod')
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  year: z.number().int().min(1900).max(2026),
  director: z.string(),
  duration: z.number().positive(),
  rate: z.number().min(0).max(10).default(5.5),
  poster: z.string().url({
    message: 'Poster must be un valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller']), {
      required_error: 'Movie genre is required',
      invalid_type_error_: 'Movie genre must be an array of enum Genre'
    }
  )

})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  // Hace opcionales todas las validaciones y si no está no pasa nada
  // Pero si está hace TODAS LAS VALIDACIONES POSIBLES
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
