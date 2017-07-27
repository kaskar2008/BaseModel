/**
 * BaseModel v2.4.10
 * Last update: 27.07.2017
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
// Feature: Processor self class source (only properties or getters)
// Ex:  '&.review.loaded.Ticket.Id as ticket_id'
// Desc: will send field 'ticket_id'
//       with value from the field 'Id'
//       in model 'review.loaded.Ticket' in current class
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
// Feature: Modifiers
// Ex1:  'name': 'allow:[null].string.length:5'
// Ex2:  'id': 'allow:[-1].int.count:2'
// Desc: Modifiers can be used within the proc, but they can break a
//       call chain and also modify value.
//       In Ex1. above there are 2 mods: 'allow' and 'length'.
//       'allow' gets an array as a parameter and
//       check value for breaking.
//       'length' get integer and do slice(5)
// ***********************************************************************
// Feature: Condition in fields
// Ex:  'text as content if(&.check1 == true)': 'string.strip:15',
// Desc: check either send this field or not
// ***********************************************************************

import { fromDot, pascalize } from './addons.js'

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
    let names_ar = names.split('.')
    return data => {
      let is_stop = false
      let acc = data
      for (let name of names_ar) {
        // check if there is a modifier
        if (name.indexOf(`:`) >= 0) {
          let full_mod = name.split(':')
          let mod_name = full_mod[0]
          let mod_params = JSON.parse(full_mod[1])
          if (this.modifiers[mod_name]) {
            let mod_result = this.modifiers[mod_name](acc, mod_params)
            acc = mod_result.value || acc
            is_stop = mod_result.break || is_stop
          }
          if (is_stop) {
            break
          }
        } else {
          acc = this.proceedProcessor(name, acc)
        }
      }
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
   * Adds one Modifier to the model
   * @param {Object}
   * @return {BaseModel}
   */
  addModifier (params) {
    var name = params.name || null
    var callie = params.proc || null
    if (!name || !callie) {
      console.error(`
        BaseAjax::addModifier()
        You should specify both name and callback
      `)
      return false
    }
    this.modifiers[name] = callie
    return this
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
   * Adds Modifiers to the model
   * @param {Object[]}
   * @return {BaseModel}
   */
  addModifiersBulk (modifiers) {
    this.modifiers = Object.assign(this.modifiers || {}, modifiers)
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
    var check = params.check || 'status'
    var result = (goodCallback, badCallback, onEnd, onError) => {
      let triggered = {
        onEnd: false,
        onError: false
      }
      fetch(uri, {
        headers: new Headers(Object.assign({},headers)),
        credentials,
        method,
        mode,
        body: data
      }).then((response) => {
        if (this.interceptor) {
          let is_continue = this.interceptor(response)
          if (!is_continue) {
            return false
          }
        }
        if (onEnd && !triggered.onEnd) {
          onEnd(response)
          triggered.onEnd = true
        }
        if (!response.ok) {
          if (onError && !triggered.onError) {
            onError(response)
            triggered.onError = true
          }
          return
        }
        return response.json().then((json) => {
          if (!json[check]) {
            if (badCallback) badCallback(json)
          } else {
            goodCallback(json)
          }
        })
      }).catch((error) => {
        if (onEnd && !triggered.onEnd) {
          onEnd()
          triggered.onEnd = true
        }
        if (onError && !triggered.onError) {
          onError(error)
          triggered.onError = true
        }
      })
      return this
    }
    return result
  }

  /**
   * Get field value from container
   * @param  {String} container
   * @param  {String} field
   * @return {Mixed}
   */
  getFieldFromContainer (container, field) {
    let context_group = this.loaded[container] ? this.loaded[container].data : null
    if (!context_group) {
      console.error(`BaseModel::getFieldFromContainer() Group ${container} not found`)
    }
    return fromDot(context_group, field)
  }

  /**
   * Parse js condition (can use '^', '&' and '@' shortcuts)
   * @param  {String} expression
   * @return {Boolean}
   */
  parseCondition (expression) {
    let items = expression.split(' ')
    for (let i in items) {
      let splitted_keys = items[i].split('.')
      if (splitted_keys.length) {
        let model_path = splitted_keys.slice(1, -1).join('.')
        let property_name = splitted_keys.slice(-1).join('')
        // from parent
        if (splitted_keys[0] == '^') {
          items[i] = fromDot(this.parent, model_path)[property_name]
        }
        // from self class
        if (splitted_keys[0] == '&') {
          items[i] = fromDot(this, model_path)[property_name]
        }
        // from container
        if (splitted_keys[0] == '@') {
          let group_name = splitted_keys[0].replace('@','')
          items[i] = this.getFieldFromContainer(group_name, model_path)[property_name]
        }
      }
    }

    expression = items.join(' ')

    return Function.apply(null, [].concat('return ' + expression))()
  }

  /**
   * Collect all model (context) to a single object
   * @param  {String} context
   * @return {Object}
   */
  getFields (context) {
    context = context || this.default_context
    var $this = this
    if (!Object.keys(this._fields[context] || []).length) {
      console.error(`
        BaseModel::getFields()
        You have to specify the field names through the
        setFieldsNames() method
      `)
      return {}
    }
    if (!this._fields[context]) {
      return this.loaded[context] || {}
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
        
        // has condition:
        let condition = el.match(/if\((.+)\)/i)
        let condition_result = true
        if (condition && condition.length > 1) {
          condition_result = $this.parseCondition(condition[1])
        }

        // if add this field
        if (condition_result) {
          // is external:
          if (el.indexOf('.') >= 0) {
            let keys = el.split(' ')[0]
            let splitted_keys = keys.split('.')
            property_name = splitted_keys.slice(-1).join('')
            // now we see - it's external
            if (splitted_keys[0] == '^' || splitted_keys[0] == '&' || splitted_keys[0].indexOf('@') === 0) {
              is_external = true
              var model_path = splitted_keys.slice(1, -1).join('.')
              // from container
              if (splitted_keys[0].indexOf('@') === 0) {
                var group_name = splitted_keys[0].replace('@','')
                model = $this.getFieldFromContainer(group_name, model_path)
              } else
              // from parent
              if (splitted_keys[0] == '^' && $this.parent) {
                model = fromDot($this.parent, model_path)
              } else
              // from self class
              if (splitted_keys[0] == '&') {
                model = fromDot($this, model_path)
              }
            }
            if (!model) {
              console.error(`BaseModel::getFields() Field ${el} not found`)
            }
            external_value = model[property_name]
            field_name = property_name
          }

          let el_without_cond = el.replace(/if\((.+)\)/ig, '').trim()

          // is alias:
          if (el_without_cond.indexOf(' as ') >= 0) {
            let keys = el_without_cond.split(' as ')
            if (!is_external) {
              property_name = keys[0]
            }
            field_name = keys[1]
          }

          value = is_external ? external_value : model[(group.is_cameled ? pascalize(property_name) : property_name)]
          var proc_names = $this.getProcessor($this._fields[context][el])
          var processors = $this.createProcessorCallie(proc_names)
          result[field_name] = processors ? processors(value) : value
        }
      })
    return result
  }

}
