import { PostModel } from './models/PostModel.js'

const post = new PostModel()

post.interceptor = (response) => {
  console.log('interceptor')
  return true
}

post.load('user', {
  id: 25654, // whatever id
  name: 'John Doe' // whatever name
})

/**
 * do some stuff here
 */

post.load('create', {
  text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
}).create(
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

  // end
  (json) => {
    // do stuff
    console.log('end')
  },

  // error
  (json) => {
    // do stuff
    console.log('error')
  }
)

/**
 * Will send:
 * {
 *   author_id: 25654
 *   is_seo: true
 *   text: "Lorem ipsum dol"
 * }
 */
