import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { componentWrapperDecorator, moduleMetadata, Story, Meta } from '@storybook/angular';

import { WithoutSelectorComponent } from './without-selector.component';

export default {
  title: 'Basics / Component / without selector / Custom wrapper ComponentFactoryResolver',
  component: WithoutSelectorComponent,
  decorators: [
    moduleMetadata({
      entryComponents: [WithoutSelectorComponent],
    }),
  ],
} as Meta;

// Advanced example with custom ComponentFactoryResolver

@Component({ selector: 'component-factory-wrapper', template: '' })
class ComponentFactoryWrapperComponent implements AfterViewInit {
  @ViewChild('dynamicInsert', { read: ViewContainerRef }) dynamicInsert;

  @Input()
  componentOutlet: Type<unknown>;

  @Input()
  args: any;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      this.componentOutlet
    );
    const containerRef = this.viewContainerRef;
    containerRef.clear();
    const dynamicComponent = containerRef.createComponent(componentFactory);
    Object.assign(dynamicComponent.instance, this.args);
  }
}

export const WithComponentFactoryResolver: Story = (args) => ({
  props: args,
  // Require a complete rendering to take into account the args change by controls addon.
  renderMode: 'full',
});
WithComponentFactoryResolver.storyName = 'Custom wrapper ComponentFactoryResolver';
WithComponentFactoryResolver.argTypes = {
  name: { control: 'text' },
  color: { control: 'color' },
};
WithComponentFactoryResolver.args = { name: 'Dixie Normous', color: 'chartreuse' };
WithComponentFactoryResolver.decorators = [
  moduleMetadata({
    declarations: [ComponentFactoryWrapperComponent],
  }),
  componentWrapperDecorator(ComponentFactoryWrapperComponent, ({ args }) => ({
    args,
    componentOutlet: WithoutSelectorComponent,
  })),
];
