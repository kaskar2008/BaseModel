import { BaseModel } from '../../classes/BaseModelClass.js'

export class PostModel extends BaseModel {
  constructor (parent, data = null) {
    super(parent, data)
    this.setFieldsNames('save', {
      'user.id': 'int', // will get value from parent.user.id
      'phone': 'string',
      'user.name as author': 'string', // will get value from parent.user.name
      'email': 'string'
    })
  }

  update (newData) {
    this._loaded = newData
    return this
  }

  save (goodCallback, badCallback) {
    this.generateQuery({
      uri: '/ajax/client',
      method: 'POST',
      model: 'save'
    })(goodCallback, badCallback)
    return this
  }
}
