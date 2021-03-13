import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { DecoratorFunction } from '@storybook/addons';

const FOO_FN_TOKEN = new InjectionToken<() => string>('FOO_FN_TOKEN');

@Component({
  selector: 'foo-fn',
  template: `<p [innerHTML]="desc"></p>
    <h3>Foo: {{ fooValue }}</h3>`,
})
class FooFnComponent {
  @Input()
  desc: string;

  fooValue: string;

  constructor(
    @Inject(FOO_FN_TOKEN)
    fooFn: () => string
  ) {
    console.info('Constructor of FooFnComponent -> New Render');

    this.fooValue = fooFn();
  }
}

export default {
  title: 'Core / Render Mode',
  component: FooFnComponent,
  decorators: [
    moduleMetadata({
      declarations: [FooFnComponent],
    }),
  ],
  argTypes: {
    foo: { control: 'text' },
    desc: { control: false },
  },
} as Meta;

export const DefaultRenderMode: Story = (args) => ({
  props: {
    desc:
      "The change of value by the foo control does not trigger a complete story rendering because it's in a function",
  },
  moduleMetadata: {
    providers: [{ provide: FOO_FN_TOKEN, useValue: () => args.foo }],
  },
});
DefaultRenderMode.storyName = 'with default render mode';

export const FullRenderMode: Story = (args) => ({
  props: {
    desc: `
      With renderMode=full the story is fully rendered at each change. <br>
      It is preferable not to use this mode by default, because it loses performance if controls only change Input/Output of the component or template
    `,
  },
  renderMode: 'full',
  moduleMetadata: {
    providers: [{ provide: FOO_FN_TOKEN, useValue: () => args.foo }],
  },
});
FullRenderMode.storyName = 'with "full" render mode';

export const FullRenderModeWithDecorator: Story = () => ({
  props: {
    desc: `
      With renderMode=full by decorator. <br>
      It is possible to optimize and add this rendering mode only if the value changes
    `,
  },
});
FullRenderModeWithDecorator.storyName = 'with "full" render mode in decorator';
FullRenderModeWithDecorator.args = {
  foo: 'Foo',
};

let currentFooValue;
const withFooAndLocaleProvider: DecoratorFunction = (storyFunc, context) => {
  const { locale } = context.globals;
  const { foo } = context.args;
  const fooValue = `${foo} in ${locale}`;

  const needFullRendering = !currentFooValue || currentFooValue !== fooValue;
  currentFooValue = fooValue;

  return {
    ...moduleMetadata({
      providers: [{ provide: FOO_FN_TOKEN, useValue: () => fooValue }],
    })(storyFunc, context),
    renderMode: needFullRendering ? 'full' : undefined,
  };
};

FullRenderModeWithDecorator.decorators = [withFooAndLocaleProvider];
