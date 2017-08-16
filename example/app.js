import { PostModel } from './models/PostModel.js'

const post = new PostModel()

post.interceptor = (response) => {
  console.log('interceptor', response)
  return true
}

post.load('user', {
  id: 25654, // whatever id
  name: 'John Doe' // whatever name
})

/**
 * do some stuff here
 */

post.load('post-data', {
  text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
})
.create()
  .then((json) => {
    console.log(json)
  })
  .catch((err) => {
    if (err) {
      console.log('error', err)
    } else {
      console.log('err')
    }
  })

/**
 * Will send:
 * {
 *   author_id: 25654
 *   content: "Lorem ipsum dol"
 * }
 */

/**
 * Do some stuf here
 */

post.load('post-data', {
  text: 'New text for this article. Now you can see the difference'
})
.edit(12)
  .then((json) => {
    console.log(json)
  })
  .catch((err) => {
    if (err) {
      console.log('error', err)
    } else {
      console.log('err')
    }
  })
