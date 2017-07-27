import { PostModel } from './models/PostModel.js'

const app = {}

app.user = {
  id: 25654, // whatever id
  name: 'John Doe' // whatever name
}

app.post = new PostModel(app)

/**
 * do some stuff here
 */

app.post.load({
  phone: '555555555',
  email: 'qwe@qwe.qw'
}, false).save(
  // good
  (json) => {
    // do stuff
    console.log('good')
  },

  // bad
  (json) => {
    // do stuff
    console.log('bad')
  },
)

/**
 * Will send:
 * {
 *   "id": 25654,
 *   "phone": "555555555",
 *   "author": "John Doe",
 *   "email": "qwe@qwe.qw"
 * }
 */
