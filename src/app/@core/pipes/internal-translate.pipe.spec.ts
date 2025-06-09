import { MyTranslatePipe } from './internal-translate.pipe';

describe('InternalTranslatePipe', () => {
  it('create an instance', () => {
    const pipe = new MyTranslatePipe();
    expect(pipe).toBeTruthy();
  });
});
