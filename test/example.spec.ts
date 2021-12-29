import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Users', () => {
  test('ensure home page works', async (_) => {
    /**
     * Make request
     */
    const { body } = await supertest(BASE_URL).get('/users').expect(401)
    console.log(body, 'response')
  })
})
