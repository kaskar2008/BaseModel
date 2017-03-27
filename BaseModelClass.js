/**
 * BaseModel v2.4.5
 * Last update: 15.03.2017
 * 
 * @author kaskar2008
 */

// *****************************Features**********************************
// Feature: Processor field alias
// Ex:  'id as ticket_id'
// Desc: will send field 'ticket_id' with value of the field 'id'
// ***********************************************************************
// Feature: Processor alias
// Ex:  'id' : '@group_name.ticket_id'
// Desc: will insert processor[s] associated with the field 'ticket_id'
//       from group 'group_name'
// ***********************************************************************
// Feature: Processor external source
// Ex:  '^.review.loaded.Ticket.Id as ticket_id'
// Desc: will send field 'ticket_id'
//       with value from the field 'Id'
//       in model 'parent.review.loaded.Ticket'
// ***********************************************************************
// Feature: Processor inner object
// Ex:  'city.id as city_id'
// Desc: will send field 'city_id'
//       with value from the field 'id'
//       in current model from object 'city'
// ***********************************************************************
// Feature: Processor value from another container[group]
// Ex:  '@group_name.city.id as city_id'
// Desc: will send field 'city_id'
//       with value from the field 'id'
//       in current model from object 'city' from group 'group_name'
// ***********************************************************************
// Feature: Data load in group
// Ex:  load('group_name', data)
// Desc: getFields now take data from group
// ***********************************************************************

import { fromDot, pascalize } from './helpers/addons.js'

export class BaseModel {

  /**
   * @param  {Object} parent
   * @param  {Object} data
   * @return {BaseModel}
   */
  constructor (parent, data = null) {
    this.default_context = 'default'
    this._fields = {}
    this._loaded = {}
    this._loaded[this.default_context] = {}
    this.parent = parent || null
    this.load(this.default_context, data)
    this.processors = {}
    this.addFieldProcessorsBulk({
      'nullable': value => !value ? null : value,
      'int': value => !value ? 0 : (parseInt(value) ? parseInt(value) : 0),
      'string': value => (typeof value) == 'string' ? value : (!value ? '' : ''+value),
      'array': value => Array.isArray(value) ? value : [],
      'bool': value => value ? true : false,
      // Processors for testing:
      'usd': value => value.toString() != 'NaN' ? (value.toString().indexOf('$') < 0 ? value+'$' : value) : value,
      'kzt': value => value.toString() != 'NaN' ? (value.toString().indexOf('₸') < 0 ? value+'₸' : value) : value
    })
  }

  /**
   * Creates a Func that will be serving data
   * @param  {String} names
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
   * Calls a FieldProcessor
   * @param  {String} name
   * @param  {Mixed} data
   * @return {Mixed}
   */
  proceedProcessor (name, data) {
    if (this.processors[name])
      return this.processors[name](data)
    else
      return undefined
  }

  /**
   * Get Processor name from aliases
   * @param  {String} name
   * @return {String}
   */
  getProcessor (name) {
    if (name.indexOf('@') >= 0) {
      var splitted_keys = name.split('.')
      var group_name = splitted_keys[0].replace('@','')
      var group_data = this._fields[group_name] || null
      var property_name = splitted_keys.slice(-1).join('')
      var model_path = splitted_keys.slice(1, -1).join('.')
      var model = fromDot(group_data, model_path)
      if (model) {
        var proc_name = model[property_name]
        return this.getProcessor(proc_name)
      } else {
        console.error(`BaseModel::getProcessor() Model ${name} not found`) 
      }
    } else {
      return name
    }
  }

  /**
   * Adds one FieldProcessor to the model
   * @param {Object} params [FieldProcessor with name and proc]
   * @return {BaseModel}
   */
  addFieldProcessor (params) {
    var $this = this
    var name = params.name || null
    var callie = params.proc || null
    if (!name || !callie) {
      console.error(`
        BaseModel::addFieldProcessor()
        You should specify both name and callback
      `)
      return false
    }
    this.processors[name] = callie
    return this
  }

  /**
   * Adds FieldProcessors to the model
   * @param {Object[]} processors
   * @return {BaseModel}
   */
  addFieldProcessorsBulk (processors) {
    this.processors = Object.assign(this.processors || {}, processors)
    return this
  }

  /**
   * @return {Object}
   */
  get loaded () {
    return this._loaded || {}
  }

  /**
   * Loads data into the model
   * @param  {String} group [Container name]
   * @param  {Object} data
   * @param  {Boolean} is_cameled [Data is cameled]
   * @return {BaseModel}
   */
  load (group, data, is_cameled = false) {
    if (this._loaded[group]) {
      if (this._loaded[group].data) {
        this._loaded[group].data = Object.assign(this._loaded[group].data || {}, data)
        this._loaded[group].is_cameled = is_cameled
      } else {
        this._loaded[group] = {data: data, is_cameled: is_cameled}
      }
    } else {
      this._loaded[group] = {data: data, is_cameled: is_cameled}
    }
    return this
  }

  /**
   * Updates data in a container
   * @param  {String} container
   * @param  {Mixed} param
   * @param  {Mixed} value
   * @return {BaseModel}
   */
  update (container, param, value = null) {
    if (this.loaded[container]) {
      if (param !== null && typeof param === 'object') {
        for (var key in param) {
          this.loaded[container].data[key] = param[key]
        }
      } else {
        this.loaded[container].data[param] = value
      }
    }
    return this
  }

  /**
   * Creates a Model structure
   * @param {String} context
   * @param {Object} names
   * @return {BaseModel}
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
    return this
  }

  /**
   * Creates a Model structure
   * @param {Object} data
   * @return {BaseModel}
   */
  setFieldsNamesBulk (data) {
    if (!data instanceof Object) {
      console.error('BaseModel::setFieldsNamesBulk() data must be an instance of the Object')
      return
    }
    Object.assign(this._fields, data)
    return this
  }

  /**
   * Generates a function for fetching
   * @param  {Object} params
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
    var mode = params.mode
    var headers = params.headers || {}
    var credentials = params.credentials
    var result = (goodCallback, badCallback, onEnd, onError) => {
      fetch(uri, {
        headers: new Headers(Object.assign({},headers)),
        credentials,
        method,
        mode,
        body: data
      }).then((response) => {
        if (this.interceptor) this.interceptor(response)
        if (onEnd) onEnd(response)
        if (!response.ok) {
          if (onError) onError(response)
          return
        }
        response.json().then((json) => {
          if (!json.status) {
            if (badCallback) badCallback(json)
          } else {
            goodCallback(json)
          }
        })
      }).catch((error) => {
        if (this.interceptor) this.interceptor(error)
        if (onEnd) onEnd()
        if (onError) onError(error)
      })
      return this
    }
    return result
  }

  /**
   * @param  {String} context
   * @return {Object}
   */
  getFields (context) {
    context = context || this.default_context
    var $this = this
    if (!this._fields[context] && !Object.keys(this._fields[context] || []).length) {
      console.error(`
        BaseModel::getFields()
        You have to specify the field names through the
        setFieldsNames() method
      `)
      return {}
    }
    var result = {}
    Object.keys(this._fields[context])
      .map((el) => {
        var group = $this.loaded[context] || {}
        var model = group.data
        var field_name = el
        var property_name = el
        var value = null
        var external_value = null
        var is_external = false
        // is external:
        if (el.indexOf('.') >= 0) {
          let keys = el.split(' ')[0]
          let splitted_keys = keys.split('.')
          property_name = splitted_keys.slice(-1).join('')
          // now we see - it's external
          if ($this.parent != null && (splitted_keys[0] == '^' || splitted_keys[0].indexOf('@') >= 0)) {
            is_external = true
            var model_path = splitted_keys.slice(1, -1).join('.')
            if (splitted_keys[0].indexOf('@') >= 0) {
              var group_name = splitted_keys[0].replace('@','')
              var cont_group = $this.loaded[group_name] ? $this.loaded[group_name].data : null
              if (!cont_group) {
                console.error(`BaseModel::getFields() Group ${group_name} not found`)
              }
              model = fromDot(cont_group, model_path)
            } else
            if (splitted_keys[0] == '^') {
              model = fromDot($this.parent, model_path)
            }
          }
          if (!model) {
            console.error(`BaseModel::getFields() Field ${el} not found`)
          }
          external_value = model[property_name]
          field_name = property_name
        }
        // is alias:
        if (el.indexOf(' as ') >= 0) {
          let keys = el.split(' as ')
          if (!is_external) {
            property_name = keys[0]
          }
          field_name = keys[1]
        }
        
        value = is_external ? external_value : model[(group.is_cameled ? pascalize(property_name) : property_name)]
        var proc_names = $this.getProcessor($this._fields[context][el])
        var processors = $this.createProcessorCallie(proc_names)
        result[field_name] = processors ? processors(value) : value
      })
    return result
  }

}
