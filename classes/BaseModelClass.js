/**
 * BaseModel v1
 * 
 * @author kaskar2008
 */

// *****************************Features**********************************
// Feature: Processor alias
// Ex:  'id as ticket_id'
// Desc: will send field 'ticket_id' with value of the field 'id'
// ***********************************************************************
// Feature: Processor external source
// Ex:  'review.loaded.Ticket.Id as ticket_id'
// Desc: will send field 'ticket_id'
//       with value from the field 'Id' in model 'review.loaded.Ticket'
//       from parent object
// ***********************************************************************

import { decamelize, fromDot, pascalize } from './addons.js'

export class BaseModel {

  /**
   * @param  {VueComponent}
   * @param  {Object}
   * @return {BaseModel}
   */
  constructor (parent, data = null) {
    this.default_context = 'default'
    this.parent = parent || null
    this.load(data)
    this.processors = {}
    this.addFieldProcessorsBulk({
      'int': value => parseInt(value),
      'string': value => (typeof value) == 'string' ? value : (!value ? '' : ''+value),
      'array': value => Array.isArray(value) ? value : [],
      // Processors for testing:
      'usd': value => value.toString() != 'NaN' ? (value.toString().indexOf('$') < 0 ? value+'$' : value) : value,
      'kzt': value => value.toString() != 'NaN' ? (value.toString().indexOf('₸') < 0 ? value+'₸' : value) : value
    })
    this._fields = {}
  }

  /**
   * @param  {String}
   * @return {Func}
   */
  createProcessorCallie (names) {
    names = names.split('.')
    return data => {
      let acc = data
      names.forEach(func => {
        acc = this.proceedProcessor(func, acc)
      })
      return acc
    }
  }

  /**
   * @param  {String}
   * @param  {Mixed}
   * @return {Mixed}
   */
  proceedProcessor (name, data) {
    if (this.processors[name])
      return this.processors[name](data)
  }

  /**
   * @param {Object}
   */
  addFieldProcessor (params) {
    var $this = this
    var name = params.name || null
    var callie = params.proc || null
    if (!name || !callie) {
      console.error(`
        BaseAjax::addFieldProcessor()
        You should specify both name and callback
      `)
      return false
    }
    this.processors[name] = callie
  }

  /**
   * @param {Object[]}
   */
  addFieldProcessorsBulk (processors) {
    this.processors = Object.assign(this.processors || {}, processors)
  }

  /**
   * @return {Object}
   */
  get loaded () {
    return this._loaded || null
  }

  /**
   * @param  {Object}
   * @param  {Boolean}
   * @return {BaseModel}
   */
  load (data, is_cameled = true) {
    this._loaded = data || null
    this.is_cameled = is_cameled
    return this
  }

  /**
   * Creates a Model structure
   * @param {String}
   * @param {Object}
   */
  setFieldsNames (context, names) {
    if (!names && context instanceof Object) {
      names = context
      context = this.default_context
    } else
    if (!names && !context) {
      return false
    }
    this._fields[context] = names || {}
  }

  /**
   * @param {Object}
   */
  setFieldsNamesBulk (data) {
    if (!data instanceof Object) {
      console.error('BaseModel::setFieldsNamesBulk() data must be an instance of the Object')
      return
    }
    Object.assign(this._fields, data)
  }

  /**
   * Generates a function for fetching
   * @param  {Object}
   *           uri        requestUri
   *           method     POST|GET|DELETE|PATCH|PUT
   *           model      Context name
   *           data       Data to send
   * @return {Function}
   */ 
  generateQuery (params) {
    var uri = params.uri
    var method = params.method || 'GET'
    var model = params.model || null
    var data = model ? JSON.stringify(this.getFields(model)) : (params.data || null)
    var result = (goodCallback, badCallback) => {
      if (!this.parent) {
        console.error(self.constructor.name + ': Parent is not configured')
        return this
      }
      fetch(uri, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        method: method,
        body: data
      }).then((response) => {
        if (!response.ok) {
          if (badCallback) badCallback()
          return false
        }
        return response.json().then((json) => {
          if (!json.status) {
            if (badCallback) badCallback(json)
          } else {
            goodCallback(json)
          }
        })
      }).catch((error) => {
        if (badCallback) badCallback()
      })
      return this
    }
    return result
  }

  /**
   * @param  {String}
   * @return {Object}
   */
  getFields (context) {
    context = context || this.default_context
    var $this = this
    if (!this._fields[context] && !Object.keys(this._fields[context] || []).length) {
      console.error(`
        BaseAjax::getFields()
        You have to specify the field names through the
        setFieldsNames() method
      `)
      return {}
    }
    var result = {}
    Object.keys(this._fields[context])
      .map((el) => {
        var model = $this.loaded
        var field_name = el
        var property_name = el
        var value = null
        var external_value = null
        var is_external = false
        // is external:
        if (el.indexOf('.') >= 0) {
          let keys = el.split(' ')[0]
          property_name = keys.split('.').slice(-1).join('')
          let model_path = keys.split('.').slice(0, -1).join('.')
          model = fromDot($this.parent, model_path)
          if (!model) {
            console.error(`BaseModel::getFields() Model ${el} not found`)
          }
          external_value = model[property_name]
          field_name = property_name
          is_external = true
        }
        // is alias:
        if (el.indexOf(' as ') >= 0) {
          let keys = el.split(' as ')
          if (!is_external) {
            property_name = keys[0]
          }
          field_name = keys[1]
        }
        
        value = is_external ? external_value : model[($this.is_cameled ? pascalize(property_name) : property_name)]
        var proc_names = $this._fields[context][el]
        var processors = $this.createProcessorCallie(proc_names)
        result[field_name] = processors ? processors(value) : value
      })
    return result
  }

}
