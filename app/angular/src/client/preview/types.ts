export interface NgModuleMetadata {
  declarations?: any[];
  entryComponents?: any[];
  imports?: any[];
  schemas?: any[];
  providers?: any[];
}
export interface ICollection {
  [p: string]: any;
}

export interface IStorybookStory {
  name: string;
  render: () => any;
}

export interface IStorybookSection {
  kind: string;
  stories: IStorybookStory[];
}

/**
 * Choose the rendering mode for angular client (created by RendererService):
 * - 'propsOnly': (default) Optimizes the rendering by sending the updated `props` to the existing angular client.
 *                A full render is still triggered if the final template or module metadata structure is different from the previous one. And
 *                depending on the `forceRender` in story RenderContext.
 * - 'full': Each render completely reloads the story in the angular client. Useful if `propsOnly` mode does not trigger an expected full render.
 * /!\ does not work with angularLegacyRendering
 */
export type RenderMode = 'propsOnly' | 'full';

export interface StoryFnAngularReturnType {
  /** @deprecated `component` story input is deprecated, and will be removed in Storybook 7.0. */
  component?: any;
  props?: ICollection;
  /** @deprecated `propsMeta` story input is deprecated, and will be removed in Storybook 7.0. */
  propsMeta?: ICollection;
  moduleMetadata?: NgModuleMetadata;
  template?: string;
  styles?: string[];
  renderMode?: RenderMode;
}
