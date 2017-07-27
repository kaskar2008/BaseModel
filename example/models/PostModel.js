import { BaseModel } from '../../classes/BaseModelClass.js'

export class PostModel extends BaseModel {
  constructor () {
    super()
    this.setFieldsNamesBulk({
      user: {
        'id': 'int',
        'name': 'string'
      },
      create: {
        '@user.id as author_id': 'int',
        'text as content if(&.check1 == true)': 'string.strip:15',
        '&.isSeo as is_seo': 'allow:[null].bool'
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

  get check1 () {
    // do some logic
    return this.isSeo == true
  }

  get isSeo () {
    // do some stuff here
    // ...
    return true
  }

  create (goodCallback, badCallback, onEnd, onError) {
    this.generateQuery({
      uri: 'localhost/api/v2/post',
      method: 'POST',
      model: 'create'
    })(goodCallback, badCallback, onEnd, onError)
  }
}
