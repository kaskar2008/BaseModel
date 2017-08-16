import { BaseModel } from '../../classes/BaseModelClass.js'

export class PostModel extends BaseModel {
  constructor () {
    super()
    this.setFieldsNamesBulk({
      user: {
        'id': 'int',
        'name': 'string'
      },
      'post-data': {
        '@user.id as author_id if(&.isLoggedIn == true)': 'int',
        'text as content': 'allow:[null].string.strip:15',
        '&.isSeo as is_seo if(&.isSeo == true)': 'bool'
      }
    })
    this.addModifiersBulk({
      'strip': (value, param) => {
        return { value: value.substr(0, param) }
      },
      'allow': (value, params) => {
        return { break: params.indexOf(value) >= 0 }
      },
    })
  }

  get isLoggedIn () {
    // do some logic
    return Boolean(this.getFieldFromContainer('user', 'id'))
  }

  get isSeo () {
    // do some stuff here
    // ...
    return false
  }

  create () {
    return this.generateQuery({
      uri: 'localhost/api/v2/post',
      method: 'POST',
      model: 'post-data'
    })()
  }

  edit (id) {
    return this.generateQuery({
      uri: `localhost/api/v2/post/${id}`,
      method: 'PUT',
      model: 'post-data'
    })()
  }
}
