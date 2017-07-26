# BaseModel
JS Class to simplify work with APIs

**Features**

 - Processors (formatters):
   - Field alias
   - Processor alias
   - External source
   - Self class source (only properties or getters)
   - Inner object
   - Value from another container[group]
 - Modifiers
 - Data load in group

**Processors examples**

Field alias:

    this.setFieldsNamesBulk({
      user: {
        'id as user_id': 'int'
      }
    })

Processor alias:

    this.setFieldsNamesBulk({
      user: {
        'id': 'int'
      },
      test: {
        'uid': '@user.id' // will paste 'int'
      }
    })

External source:

    this.setFieldsNamesBulk({
      user: {
        'id': 'int'
      },
      test: {
        '^.cache.user_id as uid': 'int' // will get object 'cache' from parent and get field 'user_id'
      }
    })

Self class source (only properties or getters):

    this.setFieldsNamesBulk({
      user: {
        'id': 'int'
      },
      test: {
        '&.uid': '@user.id' // will get field 'uid' from current class
      }
    })

Inner object:

    this.setFieldsNamesBulk({
      user: {
        'id': 'int'
      },
      test: {
        'some_obj.uid': '@user.id' // will get field 'uid' from object 'some_obj' in current model/group/container
      }
    })

Value from another container[group]:

    this.setFieldsNamesBulk({
      user: {
        'id': 'int'
      },
      test: {
        '@user.id': 'int' // will paste 'id'
      }
    })

**Modifiers examples**

    this.setFieldsNamesBulk({
      user: {
        'id': 'int',
        'name': 'string'
      },
      create: {
        '@user.id as author_id': 'int',
        'text': 'string.strip:15',
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
    

> **Note**: Modifiers should return only object. Modifiers work in two ways: modify fields and break processor call chain.
> 
> * To modify field your modifier should return value in object:
> `{ value: 'new value' }`
> 
> * To break call chain your modifier should return break: true in object:
> `{ break: true }`
> Modifiers can also take array as an argument (only JSON valid)
