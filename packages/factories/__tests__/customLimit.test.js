const CustomLimit = require('../customLimit')

const customLimit = new CustomLimit();

describe('CustomLimit', () => {
  it('execute', async () => {
    const ret = await customLimit.execute(`${Date.now()}/1000`, () => 'helloWorld');
    expect(ret).toEqual('helloWorld');
    expect(customLimit.length()).toEqual(1);
  });

  it('clear all', async () => {
    await customLimit.execute(`${Date.now()}/1000`, () => 'helloWorld');
    customLimit.clearAll();
    expect(customLimit.length()).toEqual(0);
  });

  it('get value', async () => {
    const key = `${Date.now()}/1000`;
    await customLimit.execute(key, () => 'helloWorld');
    const ret = customLimit.getValue(key);
    expect(ret).toEqual('helloWorld');
  });

  it('exists key', async () => {
    const key = `${Date.now()}/100000`;
    await customLimit.execute(key, () => 'helloWorld');
    const ret = await customLimit.execute(key, () => 'kkWoeld');
    expect(ret).toEqual('helloWorld');
  });

  it('cache length is 1', async () => {
    await customLimit.execute(`${Date.now()}`, () => 'helloWorld');
    await customLimit.execute(`${Date.now()}`, () => 'kkWoeld');
    expect(customLimit.length()).toEqual(1);
  });
});
