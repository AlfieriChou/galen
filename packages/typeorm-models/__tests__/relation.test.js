const createRelations = require('../lib/relation')

describe('test relation', () => {
  it('belongsTo', done => {
    const relations = createRelations({
      relations: {
        user: {
          type: 'belongsTo',
          model: 'User'
        }
      }
    })
    expect(relations).toHaveProperty('user')
    expect(relations.user).toHaveProperty('type')
    expect(relations.user).toHaveProperty('target')
    expect(relations.user.type).toEqual('one-to-one')
    expect(relations.user.target).toEqual('user')
    done()
  })

  it('hasMany', done => {
    const relations = createRelations({
      relations: {
        users: {
          type: 'hasMany',
          model: 'User'
        }
      }
    })
    expect(relations).toHaveProperty('users')
    expect(relations.users).toHaveProperty('type')
    expect(relations.users).toHaveProperty('target')
    expect(relations.users.type).toEqual('many-to-many')
    expect(relations.users.target).toEqual('user')
    done()
  })
})