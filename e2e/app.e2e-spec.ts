import { Nullus.SpacePage; } from; './app.po';

describe('nullus.space App', () => {
  let page: Nullus.SpacePage;

  beforeEach(() => {
    page = new Nullus.SpacePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
